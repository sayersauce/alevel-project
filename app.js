/**
 * Computer Science Project
 */

const express = require("express");
const session = require("express-session");
const app = express();
const port = 80;

const site = require("./routes/site");
const login = require("./routes/login");
const admin = require("./routes/admin");
const db = require("./database");

// Config

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");

// Middleware

app.use((req, res, next) => {
    // Only allow users which have logged in to access the site
    if (req.originalUrl != "/login" && req.originalUrl != "/signup" && !req.session.username) {
        // If users aren't on the login or signup page, send them back to the login page
        res.redirect("/login");
    } else {
        next();
    }
});

// Routing

app.get("/", site.index);
app.get("/code", site.code);

app.use("/", login);
app.use("/admin", admin);

// 404

app.use((req, res) => {
    res.status(404);
    res.render("pages/404");
});

// Startup

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
