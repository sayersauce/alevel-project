/**
 * Computer Science Project
 */

const express = require("express");
const app = express();
const port = 80;

const site = require("./routes/site");
const login = require("./routes/login");
const admin = require("./routes/admin");
const db = require("./database");

// Config

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Routing

app.get("/", site.index);
app.get("/login", login.login);
app.get("/signup", login.signup);
app.get("/users", (req, res) => {
    db.getUsers((rows) => {
        res.send(rows);
    });
});
app.get("/code", site.code);
app.get("/admin", admin.admin);

app.post("/login", login.loginSubmit);
app.post("/signup", login.signupSubmit);

app.use(function (req, res) {
    res.status(404);
    res.render("pages/404");
});

// Startup

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
