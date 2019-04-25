const pm2 = require('pm2');

const promisify = async (method, ...args) => new Promise((resolve, reject) => {
    pm2[method](...args, (err, res) => err ? reject(err) : resolve(res));
});

(async () => {

    // Launch pm2
    await promisify('start', './ecosystem.json');
    const bus = await promisify('launchBus');

    // Create message broadcaster
    bus.on('process:broadcast', async packet => {
        const list = await promisify('list');
        const {process: {pm_id}, data} = packet;

        for (const {pm2_env} of list) {
            const id = pm2_env.pm_id;
            if (id !== pm_id) {
                promisify('sendDataToProcessId', {
                    data: {
                        type: 'broadcast',
                        data
                    }, id,
                    type: 'process:msg',
                    topic: 'broadcast'
                }).catch(console.warn); // eslint-disable no-console
            }
        }
    });
})();
