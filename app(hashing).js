require('dotenv').config();
const express =require("express");
const bodyParser = require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt")
saltRounds = 10;
const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect(process.env.DB_KEY,{useNewUrlParser:true})
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("connected to Mongo");
});

const secretsSchema=new mongoose.Schema({
    email:String,
    password:String,
    gender:String
});


const secret = new mongoose.model("secret",secretsSchema);

app.get("/",function(req,res){
    res.render("home");
})
 
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    secret.findOne({email:username}).then((userfound)=>{
        if(!userfound){
            console.log("user not found");
            res.render("login.ejs")
        }
        else{
            bcrypt.compare(password, userfound.password, function(err, result) {
                // result == true
                if(result===true){
                    res.render("secrets.ejs");
                }
                
                else{
                    console.log("Hy there is a password mismatch")
                }
            });
        }
    });
})
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const user=new secret({
            email:req.body.username,
            password:hash,
            gender:req.body.gender
        });
        user.save();
        res.redirect("/login");
        
    });
})


app.listen(3000,function () {
    console.log("Server has Started");
  })