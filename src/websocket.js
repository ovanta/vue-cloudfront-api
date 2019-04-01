const userModel = require('./models/user');
const maxmind = require('maxmind');
const geolite2 = require('geolite2');
const WebSocket = require('ws');

const lookup = maxmind.openSync(geolite2.paths.city);

const userMap = {};

/**
 * Launches the websocket broadcast server
 * @param server
 */
module.exports.launch = server => {
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
                        const lu = lookup.get(req.connection.remoteAddress);

                        ws._sessionInfo = {
                            city: lu.city.names.en,
                            continent: lu.continent.names.en,
                            country: lu.country.names.en,
                            location: lu.location,
                            registeredCountry: lu.registered_country.names.en,
                            registerTimestamp: Date.now()
                        };

                        userMap[userid].websockets.push(ws);

                        // Approve registration
                        ws.send(JSON.stringify({
                            type: 'registration-approval',
                            value: {
                                lastBroadcast: userMap[userid].lastBroadcast
                            }
                        }));
                    }

                    break;
                }
                case 'broadcast': {
                    if (user) {
                        const container = userMap[user.id];
                        const {websockets} = container;

                        // Broadcast message
                        for (let i = 0, l = websockets.length; i < l; i++) {
                            const socket = websockets[i];

                            if (socket !== ws) {
                                socket.send(JSON.stringify({
                                    type: 'broadcast',
                                    value
                                }));
                            }
                        }

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
                    websockets.splice(idx, 1);
                }

                // Clean up if no connection is open anymore
                if (!websockets.length) {
                    delete userMap[user.id];
                }
            }
        });
    });
};

/**
 * Returns the amount of currenty connected user
 * @param userid
 * @returns {number}
 */
module.exports.getSessionsBy = userid => {
    const user = userMap[userid];
    return ((user && user.websockets) || []).map(v => v._sessionInfo);
};
