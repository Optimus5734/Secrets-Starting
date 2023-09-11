require('dotenv').config();
const express =require("express");
const bodyParser = require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const session = require("express-session");  //authentication //cookies
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(session({
    secret:"Our secret.",
    resave:false,
    saveUninitialized:false

}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_KEY,{useNewUrlParser:true});
// mongoose.set("useCreateIndex",true)
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

secretsSchema.plugin(passportLocalMongoose);
const secret = new mongoose.model("secret",secretsSchema);
passport.use(secret.createStrategy());
passport.serializeUser(secret.serializeUser());
passport.deserializeUser(secret.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
})
 
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",(req,res)=>{
    const user = new secret({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
})

app.get("/secrets",function (req,res) { 
    if(req.isAuthenticated()){
        res.render("secrets")
    }
    else{
        res.redirect("/login");
    }
 })
 app.get('/logout', (req, res) => {
    req.logout(() => {});
    res.redirect('/'); // Redirecting to the home page or a different page after logout
  });
  
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",(req,res)=>{
    secret.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }

    })
})


app.listen(3000,function () {
    console.log("Server has Started");
  })