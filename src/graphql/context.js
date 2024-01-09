module.exports = ({ req }) => {
    const authorization = req.headers.authorization;
    if (!authorization) return null;
    if (!authorization && authorization.startsWith('Bearer ')) return null;
    const token = authorizationHeader.toString().split('Bearer ')[1];
    if(!token) return null;
    return token;
}
