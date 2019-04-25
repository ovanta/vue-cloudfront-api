const userModel = require('./models/user');
const userAgentParser = require('ua-parser-js');
const i18nCountries = require('i18n-iso-countries');
const redis = require('redis');
const redisClient = redis.createClient(process.env.NODE_ENV === 'production' ? {host: 'redis'} : undefined);
const geoip = require('geoip-lite');
const WebSocket = require('ws');

// Clear redis db
redisClient.flushall();

const userMap = {};
const websocket = {

    /**
     * Launches the websocket broadcast server
     * @param server
     */
    launch(server) {
        const wss = new WebSocket.Server({server: server});

        wss.on('connection', (ws, req) => {
            let user;

            ws.on('message', async message => {

                // Answer ping request
                if (message === '__ping__') {
                    return ws.send('__pong__');
                }

                // Try to parse message
                try {
                    message = JSON.parse(message);
                } catch (ignored) {
                    return;
                }

                const {type, value} = message;
                switch (type) {
                    case 'register': {
                        if (typeof value === 'string' && value) {
                            user = await userModel.findOne({apikeys: {$elemMatch: {key: value}}});

                            if (!user) {
                                return;
                            }

                            const userid = user.id;
                            if (!(userid in userMap)) {
                                userMap[userid] = {
                                    websockets: [],
                                    lastBroadcast: 0
                                };
                            } else if (userMap[userid].websockets.includes(ws)) {
                                return;
                            }

                            // Lookup ip info
                            const lu = geoip.lookup(req.connection.remoteAddress);

                            ws._sessionInfo = {
                                id: Math.floor(Math.random() * 1e15).toString(16) + Date.now().toString(16),
                                city: lu ? lu.city : 'Unknown',
                                country: lu ? i18nCountries.getName(lu.country, 'en') : 'Unknown',
                                device: userAgentParser(req.headers['user-agent'])
                            };

                            // Push to redis
                            redisClient.rpush(userid.toString(), JSON.stringify(ws._sessionInfo));

                            websocket.broadcast({
                                userid,
                                data: {
                                    type: 'open-session',
                                    value: ws._sessionInfo
                                }
                            });

                            // Append websocket
                            userMap[userid].websockets.push(ws);

                            if (ws.readyState === 1) {

                                // Approve registration
                                ws.send(JSON.stringify({
                                    type: 'registration-approval',
                                    value: {
                                        lastBroadcast: userMap[userid].lastBroadcast,
                                        sessions: await websocket.getSessionsBy(userid)
                                    }
                                }));
                            }
                        }

                        break;
                    }
                    case 'broadcast': {
                        if (user) {
                            const container = userMap[user.id];

                            // Broadcast message
                            websocket.broadcast({
                                ignored: ws,
                                userid: user.id,
                                data: JSON.stringify({
                                    type: 'broadcast',
                                    value
                                })
                            });

                            // Update last broadcast timestamp
                            container.lastBroadcast = Date.now();
                        }
                        break;
                    }
                }
            });

            ws.on('close', () => {

                // Check if socket was registered
                if (user) {
                    const {websockets} = userMap[user.id];
                    const idx = websockets.indexOf(ws);

                    // Remove socket
                    if (~idx) {
                        const [socket] = websockets.splice(idx, 1);

                        if (socket) {

                            // Remove from redis list
                            // TODO: Memory leak?
                            redisClient.lrem(user.id.toString(), 1, JSON.stringify(socket._sessionInfo));

                            websocket.broadcast({
                                userid: user.id,
                                data: {
                                    type: 'close-session',
                                    value: socket._sessionInfo
                                }
                            });
                        }
                    }

                    // Clean up if no connection is open anymore
                    if (!websockets.length) {
                        delete userMap[user.id];
                    }
                }
            });
        });
    },

    /**
     * Returns the amount of currenty connected user
     * @param userid
     * @returns {number}
     */
    async getSessionsBy(userid) {
        return new Promise(resolve => {

            // Resolve table
            redisClient.lrange(userid.toString(), 0, -1, (err, res) => {
                resolve(err ? [] : res.map(v => JSON.parse(v)));
            });
        });
    },

    /**
     * Broadcast to all websockets from a single user
     */
    broadcast({userid, data, ignored = null, preventBroadcast = false}) {
        const user = userMap[userid];
        const websockets = ((user && user.websockets) || []);

        if (typeof data === 'object') {
            data = JSON.stringify(data);
        }

        for (let i = 0, l = websockets.length; i < l; i++) {
            const socket = websockets[i];

            if (socket !== ignored && socket.readyState === 1) {
                socket.send(data);
            }
        }

        if (!preventBroadcast) {

            // Notify other instances
            process.send({
                type: 'process:msg',
                data: {
                    action: 'broadcast',
                    userid,
                    data
                }
            });
        }
    }
};

// Listen for other processes
process.on('message', ({data}) => {
    switch (data.action) {
        case 'broadcast': {
            const {userid, data} = data;

            return websocket.broadcast({
                userid, data,
                preventBroadcast: true
            });
        }
    }
});

/**
 * Returns the amount of currenty connected user
 * @param userid
 * @returns {number}
 */
module.exports = websocket;
