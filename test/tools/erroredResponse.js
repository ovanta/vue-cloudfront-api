module.exports = ({body: {data, error}}) => {
    return error ? Promise.resolve(error) : Promise.reject(data);
};
