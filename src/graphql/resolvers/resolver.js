const loginByPhone = require('./login/loginByPhone');
const resolvers = {
    Query: {
        hello: (_) => 'Hello',
    },

    Mutation: {
        loginByGoogle: loginByPhone,
    }
}

module.exports = resolvers;
