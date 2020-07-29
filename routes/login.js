/**
 * Login and Sign Up Routes
 */

const db = require("../database");
const hashing = require("../hashing");
const router = require("express").Router();

router.get("/login", (req, res) => {
    res.render("pages/login", { message: undefined });
});

router.get("/signup", (req, res) => {
    res.render("pages/signup", { message: undefined });
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

router.post("/login", (req, res) => {
    // Attempt to log the user in
    db.getUser(req.body.username, user => {
        if (user && hashing.check(req.body.password, user.PASSWORD)) {
            db.loginUser(req.body.username);
            req.session.username = user.USERNAME;
            req.session.admin = user.CLASS == "admins";
            res.redirect("/");
        } else {
            res.render("pages/login", { message: "You have provided an incorrect username or password." });
        }
    });
});

router.post("/signup", (req, res) => {
    // Attempt to sign the user up
    db.insertUser(req.body.username, hashing.hash(req.body.password), req.body.token, success => {
        if (success) { 
            res.render("pages/login", { message: "You have successfully signed up. Please log in." });
        } else {
            res.render("pages/signup", { message: "You have provided an invalid Access Code." });
        }
    });
});

module.exports = router;
