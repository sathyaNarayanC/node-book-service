var jwt = require("jsonwebtoken");
var config = require("./config");

function checkToken(req, res, next){
    let token = req.headers['authorization'];

    if(token && token.startsWith("Bearer")){
        token = token.slice(7, token.length);
        jwt.verify(token, config.secret, (error, decoded) => {
            if(error){
                return res.status(400).json({
                    success : false,
                    message : "Token is not valid"
                });
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }else{
        return res.status(400).json({
            success : false,
            message : "No token provided"
        });
    }
 }

 module.exports = {
    checkToken
 }