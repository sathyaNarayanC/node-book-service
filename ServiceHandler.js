var jwt =  require("jsonwebtoken");
var config = require("./config");
var getDb = require("./db").getDb;

class ServiceHandler{
    login(req, res){
        var username = req.body.username;
        var password = req.body.password;

        ServiceHandler.verifyUser(username, password , (err, response) => {
            if(err){
                throw err;
            }
            if(response){
                let token = jwt.sign(
                    {
                        username: username,
                        role : response.role
                    }, 
                    config.secret, 
                    {expiresIn: '24h'}
                );
                
                console.log("Token generated "+ token);
    
                res.status(200).json({
                    success: true,
                    message :  "Authentication successful",
                    token: token
                });
            }else{
                res.status(401).json({
                    success :  false,
                    message : "Authentication Failed, Please provide a valid username and password"
                });
            }
        });
        
    }

    static verifyUser(username, password, next){
        const db = getDb();
        let dbo = db.db("bookDB");
        dbo.collection("users").findOne({"username":username, "password": password}, (err, response) => {
            next(err, response);
        });
    }
}

module.exports = {
    ServiceHandler
}