const jwt = require('jsonwebtoken');
const res = require("express/lib/response");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // no token -> unauthorized
    if(!token) return res.status(401).send('No token provided');

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //token invalid
        if (err) return res.status(401).send('Invalid token');
        req.user = user;
        next();
    });
}

module.exports={
    authenticateToken
};
