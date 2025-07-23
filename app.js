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
app.get("/hub",(req,res)=>{
 res.render("hub/index.ejs")
});

app.get("/trail",(req,res)=>{
 res.render("grid/search.ejs")
});

app.get("/launch",(req,res)=>{
 res.render("grid/launch.ejs")
});
app.get("/testt",(req,res)=>{
 res.render("grid/grid.ejs")
});
app.get("/sparks",(req,res)=>{
 res.render("trail/sparks.ejs")
});
app.get("/footprints",(req,res)=>{
 res.render("trail/footprints.ejs")
});
app.get("/review",(req,res)=>{
 res.render("review/review.ejs")
});

app.get("/dekh",(req,res)=>{
 res.render("aura/test.ejs")
});
app.get("/manage",(req,res)=>{
 res.render("manage/manage.ejs")
});
app.get("/aura",(req,res)=>{

    res.render("aura/aura.ejs", {
  user: {
    name: "Dipesh Verma",
    title: "Full Stack Event Organizer",
    image: "/uploads/profile-dipesh.jpg",
    bio: "Passionate about creating unforgettable local experiences. 🚀",
    sparks: 24,
    footprints: 376,
    rating: 4.9,
    online: true,
    social: {
      github: "https://github.com/dipeshverma",
      linkedin: "https://linkedin.com/in/dipeshverma",
      twitter: "https://twitter.com/dipesh_codes"
    }
  },
  reviews: [
    {
      reviewer: "Harsh Codesit",
      rating: 5,
      text: "Absolutely loved the rooftop event. Super well managed!",
      date: "2025-07-19"
    },
    {
      reviewer: "Neha Sharma",
      rating: 4,
      text: "Creative themes and great crowd. Would join again.",
      date: "2025-07-15"
    },
    {
      reviewer: "Neha Sharma",
      rating: 4,
      text: "Creative themes and great crowd. Would join again.",
      date: "2025-07-15"
    },
    {
      reviewer: "Neha Sharma",
      rating: 4,
      text: "Creative themes and great crowd. Would join again.",
      date: "2025-07-15"
    },
    {
      reviewer: "Neha Sharma",
      rating: 4,
      text: "Creative themes and great crowd. Would join again.",
      date: "2025-07-15"
    }
    // add up to 5
  ]
});
// profile.ejs in /views folder
});
















































app.listen(8080, ()=>{
    console.log("port is listening")
});