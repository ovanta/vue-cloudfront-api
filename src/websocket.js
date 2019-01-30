const userModel = require('./models/user');
const WebSocket = require('ws');

module.exports = server => {
    const wss = new WebSocket.Server({server: server});
    const userMap = {};

    wss.on('connection', ws => {
        let user;

        ws.on('message', async message => {

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
                            userMap[userid] = [];
                        }

                        userMap[userid].push(ws);

                        // Approve registration
                        ws.send('registration-approval');
                    }

                    break;
                }
                case 'broadcast': {
                    if (user) {
                        const socketList = userMap[user.id];

                        // Broadcast message
                        for (let i = 0, l = socketList.length; i < l; i++) {
                            const socket = socketList[i];

                            if (socket !== ws) {
                                socket.send(JSON.stringify(value));
                            }
                        }
                    }
                    break;
                }
            }
        });

        ws.on('close', () => {

            // Check if socket was registered
            if (user) {
                const socketList = userMap[user.id];
                const idx = socketList.indexOf(ws);

                // Remove socket
                if (~idx) {
                    socketList.splice(idx, 1);
                }
            }
        });
    });
};
