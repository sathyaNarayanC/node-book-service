const initDb = require("./db").initDb;
const getDb = require("./db").getDb;
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var ServiceHandler = require("./ServiceHandler").ServiceHandler;
var loginService = new ServiceHandler();
var checkToken = require("./middleware").checkToken;

// create application/json parser
var jsonParser = bodyParser.json()
 // create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const port = 8000;


app.get("/", checkToken,  (req, res) => {
    res.write(`Welcome to book service...
        To get all books : navigate to /service/api/books - GET - For end users
        TO get book by id : naviagate to /service/api/book/{id} - GET - For end users
        TO get book by name : navigate to /service/api/book/{name} - GET -  For end users
        To create a book : navigate to /admin/create - POST -For admin user
        To delete a book : navigate to /admin/delete/{id} - DELETE - For admin user
        To update a book : navigate to /admin/update - PUT - For admin user
    `);
    res.end();
});

/**
 * Service apis
 * For users get all books and get a particular book 
 */
var serviceRoutes = express.Router();

//service api for searching all books
serviceRoutes.get("/api/books", checkToken, (req, res) => {
    const db = getDb();
    let dbo = db.db("bookDB");
    dbo.collection("books").find({}).toArray(function(err, data){
        res.status(200).json(JSON.parse(JSON.stringify(data)));
        res.end();
    });
});

//searching api for getting a particular book
/**
 * Give query param id : 2 to search by id
 */
serviceRoutes.get("/api/books/id", checkToken, (req, res) => {
    const db = getDb();
    let dbo = db.db("bookDB");
    dbo.collection("books").findOne({"_id": parseInt(req.params.id)}, function(err, data){
        if(data !== null){
            res.status(200).json(JSON.parse(JSON.stringify(data)));
            res.end();
        }else{
            res.status(200).json("no data found for id "+req.params.id);
        } 
    });
});

//searching api for getting a particular book
serviceRoutes.get("/api/books/available", checkToken, (req, res) => {
    const db = getDb();
    let dbo = db.db("bookDB");
    let isTrueSet = (req.params.flag === 'true');
    dbo.collection("books").find({"available": isTrueSet}).toArray(function(err, data){
        if(data !== null){
            res.status(200).json(JSON.parse(JSON.stringify(data)));
            res.end();
        }else{
            res.status(200).json("no data found for id "+req.params.id);
        } 
    });
});

app.use("/service", serviceRoutes);
/*End for service apis */


/*
 * Admin apis
 * For admin users add and delete books
 */
var adminRoutes = express.Router();

//create book api for admin users
adminRoutes.post("/create", jsonParser, checkToken, (req, res) => {
    console.log(`req.body in rs ${req.body}`);
    if(req.decoded.role == "Admin"){
        const db = getDb();
        let dbo = db.db("bookDB");
        dbo.collection("books").insertOne(req.body, (err, response) => {
            if(err){
                res.status(400).json({
                    status : "failed to insert data",
                    error : err
                });
            }else{
                res.status(201).json({
                    status : "record successfully created",
                    created_record : response.ops
                });
            }
            res.end();
        });
    }
    else{
        res.status(400).json({
            status : "failed",
            message : "Not a valid user"
        });
    }
});

//update book api for admin users
adminRoutes.put("/update", jsonParser, checkToken, (req, res) => {
    console.log(`req.body in rs ${req.body}`);
    const db = getDb();
    let dbo = db.db("bookDB");
    dbo.collection("books").updateOne(
        {"_id" : req.body._id},
        {$set: req.body},
        {upsert : true},
        (err, response) => {
        if(err){
            res.status(400).json({
                status : "failed to update record",
                error : err
            });
        }else{
            res.status(201).json({
                status : "record successfully updated"
            });
        }
        res.end();
    });
});

//delete book api for admin users
adminRoutes.delete("/delete/:id", checkToken, (req, res) => {  
    const db = getDb();
    let dbo = db.db("bookDB");
     
    dbo.collection("books").deleteOne({"_id" : parseInt(req.params.id)}, (err, response) => {
        if(err){
            res.status(400).json({
                status : "failed to delete the record",
                error : err
            });
        }else{
            res.status(200).json({
                status : `Record with id ${req.params.id} is successfully deleted`
            });
        }
        res.end();
    });
});

app.use("/admin", adminRoutes);
/*End for admin apis */

var loginRoute = express.Router();

loginRoute.post("/login", jsonParser,loginService.login);

app.use("/user", loginRoute);

app.use(jsonParser);
app.use(urlencodedParser);


initDb(function (err) {
    if(err){
        throw err;
    }
    app.listen(port, function (err) {
        if (err) {
            throw err;
        }
        console.log("API Up and running on port " + port);
    });
});