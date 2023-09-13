require('dotenv').config();
const express =require("express");
const bodyParser = require("body-parser");
const ejs =require("ejs");
const mongoose=require("mongoose");
const session = require("express-session");  //authentication //cookies
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app=express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");
const { profile } = require('console');

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
    gender:String,
    googleId:String,
    secret:String
});

secretsSchema.plugin(passportLocalMongoose);
secretsSchema.plugin(findOrCreate);
const secret = new mongoose.model("secret",secretsSchema);
passport.use(secret.createStrategy());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, {
        id: user.id,
        username: user.username,
        picture: user.picture
      });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID:  process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"http://www.googleapis.con/oauth2/v3/userinfo",

  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    secret.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get("/",function(req,res){
    res.render("home");
})
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));
 
app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

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
app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }
    else{
        res.redirect("/login")
    }
})
app.post("/submit",(req,res)=>{
    const sub=req.body.secret;

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


  //running with some error