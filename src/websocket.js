const userModel = require('./models/user');
const WebSocket = require('ws');

module.exports = server => {
    const wss = new WebSocket.Server({server: server});
    const userMap = {};

    wss.on('connection', ws => {
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
                                lastBroadCast: 0
                            };
                        } else if (userMap[userid].websockets.includes(ws)) {
                            return;
                        }

                        userMap[userid].websockets.push(ws);

                        // Approve registration
                        ws.send(JSON.stringify({
                            type: 'registration-approval',
                            value: {
                                lastBroadCast: userMap[userid].lastBroadCast
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
                        container.lastBroadCast = Date.now();
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
