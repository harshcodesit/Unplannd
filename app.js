const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");



app.get("/",(req,res)=>{
 res.render("hub/index.ejs")
});

app.get("/grid",(req,res)=>{
 res.render("hub/index.ejs")
})















































app.listen(8080, ()=>{
    console.log("port is listening")
});