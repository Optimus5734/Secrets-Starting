const express =require("express");
const bodyParser = require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption")
const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.connect("mongodb+srv://sagar-5734:Test123@cluster0.oc0kmhu.mongodb.net/secretsDb",{useNewUrlParser:true})
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
const secretKey = "Thisisapassword.";
secretsSchema.plugin(encrypt,{secret:secretKey,encryptedFields: ["password"]});


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
            if(userfound.password === password){
                res.render("secrets.ejs")
            }
            else{
                console.log("Hy there is a password mismatch")
            }
        }
    });
})
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",(req,res)=>{
    const user=new secret({
        email:req.body.username,
        password:req.body.password,
        gender:req.body.gender
    });

    user.save();
    res.redirect("/login");

})















app.listen(3000,function () {
    console.log("Server has Started");
  })