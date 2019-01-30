const toBase61 = (() => {
    const base61Set = '0123456789abcdefghijklmnopqrstuvwyxzABCDEFGHIJKLMNOPQRSTUVWYXZ';

    return num => {
        let result = '';

        while (num > 0) {
            result = base61Set[num % 61] + result;
            num = Math.floor(num / 61);
        }

        return result;
    };
})();

module.exports = {

    pick(object, props) {
        const newObj = {};

        for (let i = 0, l = props.length; i < l; i++) {
            const prop = props[i];
            newObj[prop] = object[prop];
        }

        return newObj;
    },

    uid(length = _config.mongodb.defaultUIDLength) {
        let uid = '';
        while (uid.length < length) {
            uid += toBase61(Date.now() * Math.floor(Math.random() * 1e15));
        }
        return uid.substring(0, length);
    },

    readableDuration(ms) {
        const types = ['millisecond', 'second', 'minute', 'hour', 'day'];
        const durations = [1, 1000, 60000, 3600000, 216000000, 5184000000];
        for (let i = 0; i < durations.length - 1; i++) {
            if (ms < durations[i + 1]) {
                const v = Math.round(ms / durations[i]);
                return `${v} ${types[i] + (v > 1 ? 's' : '')}`;
            }
        }
    }
};
