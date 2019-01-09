const config = require('../config/config');

module.exports = {

    pick(object, props) {
        const newObj = {};
        props.forEach(v => newObj[v] = object[v]);
        return newObj;
    },

    uid(length = config.defaultUIDLength) {
        let uid = '';
        while (uid.length < length) {
            uid += (Date.now() + Math.floor(Math.random() * 1e15)).toString(36);
        }
        return uid.substring(0, length);
    }
};
