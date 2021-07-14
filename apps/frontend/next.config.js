module.exports = {
    basePath: process.env.NODE_ENV === 'production' ? '/opex' : '',
    future: {
        webpack5: true,
    },
};
