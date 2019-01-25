const config = require('../config/config');

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
        props.forEach(v => newObj[v] = object[v]);
        return newObj;
    },

    uid(length = config.defaultUIDLength) {
        let uid = '';
        while (uid.length < length) {
            uid += toBase61(Date.now() * Math.floor(Math.random() * 1e15));
        }
        return uid.substring(0, length);
    }
};
