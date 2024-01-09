const me = require('./Queres/me');
const getToken = require('./getToken');
const loginByPhone = require('./login/loginByPhone');
const resolvers = {
    Query: {
        getToken: getToken,
        me: me,
    },
    Mutation: {
        loginByGoogle: loginByPhone,
    }
}

module.exports = resolvers;
