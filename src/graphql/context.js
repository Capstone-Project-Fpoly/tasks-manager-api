const { PubSub } = require("graphql-subscriptions");
const pubSub = new PubSub();
module.exports = ({ req }) => {
    const authorization = req.headers.authorization;
    if (!authorization) return null;
    if (!authorization && !authorization.startsWith('Bearer ')) return null;
    const token = authorization.toString().split(' ')[1];
    if(!token) return null;
    return {token: token,pubSub: pubSub};
}
