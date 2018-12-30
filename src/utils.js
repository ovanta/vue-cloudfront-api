module.exports = {

    pick(object, props) {
        const newObj = {};
        props.forEach(v => newObj[v] = object[v]);
        return newObj;
    },

    uid() {
        return (Date.now() + Math.floor(Math.random() * 1e15)).toString(36);
    }

};
