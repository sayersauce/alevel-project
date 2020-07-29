/**
 * Computer Science Project
 */

const express = require("express");
const session = require("express-session");
const config = require("./config");
const app = express();
const port = config.app.port;

const site = require("./routes/site");
const login = require("./routes/login");
const admin = require("./routes/admin");

// Setup

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
    const allowedUrls = ["/login", "/signup", "/forgot", "/change"];

    if (!allowedUrls.includes(req.originalUrl) && !req.session.username) {
        // If users aren't on one of the allowed pages, send them back to the login page
        res.redirect("/login");
    } else {
        // Otherwise let them through
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
