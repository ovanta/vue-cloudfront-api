module.exports = {

    pick(object, props) {
        const newObj = {};
        props.forEach(v => newObj[v] = object[v]);
        return newObj;
    }

};
