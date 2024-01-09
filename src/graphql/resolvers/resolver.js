const getToken = require('./getToken');
const loginByPhone = require('./login/loginByPhone');
const resolvers = {
    Query: {
        hello: (_) => 'Hello',
        getToken: getToken
    },

    Mutation: {
        loginByGoogle: loginByPhone,
    }
}

module.exports = resolvers;
