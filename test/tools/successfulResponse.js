module.exports = ({body: {data, error}}) => {
    return error ? Promise.reject(error) : Promise.resolve(data);
};
