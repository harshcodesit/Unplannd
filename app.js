const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



app.get("/",(req,res)=>{
 res.render("hub/index.ejs")
});

app.get("/grid",(req,res)=>{
 res.render("grid/search.ejs")
});

app.get("/test",(req,res)=>{
 res.render("includes/navbar.ejs")
});

app.get("/hub",(req,res)=>{
   const user = {
        name: "Aarya Patel",
        title: "Full Stack Developer",
        bio: "Turning coffee into scalable code. Crafting seamless web experiences one pixel at a time.",
        profilePhoto: "https://randomuser.me/api/portraits/women/44.jpg",
        twitter: "https://twitter.com/aaryadev",
        linkedin: "https://linkedin.com/in/aaryapatel",
        github: "https://github.com/aaryadev",
        isOnline: true
    };

    res.render('aura/aura.ejs', { user }); // profile.ejs in /views folder
});
















































app.listen(8080, ()=>{
    console.log("port is listening")
});