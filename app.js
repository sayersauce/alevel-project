/**
 * Computer Science Project
 */

const express = require("express");
const app = express();
const port = 80;

const site = require("./site");
const login = require("./login");
const db = require("./database");

// Config

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Routing

app.get("/", site.index);
app.get("/login", login.login);
app.post("/login", login.loginSubmit);
app.get("/signup", login.signup);
app.post("/signup", login.signupSubmit);
app.use(function (req, res) {
    res.status(404);
    res.render("pages/404");
});

// Startup

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
