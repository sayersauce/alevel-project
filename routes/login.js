/**
 * Login and Sign Up Routes
 */

const db = require("../database");
const hashing = require("../hashing");

exports.login = function(req, res) {
    res.render("pages/login", { message: undefined });
}

exports.signup = function(req, res) {
    res.render("pages/signup", { message: undefined });
}

exports.loginSubmit = function(req, res) {
    // Attempt to log the user in
    db.getUser(req.body.username, user => {
        if (user && hashing.check(req.body.password, user.PASSWORD)) {
            db.loginUser(req.body.username);
            req.session.username = user.USERNAME;
            res.redirect("/");
        } else {
            res.render("pages/login", { message: "You have provided an incorrect username or password." });
        }
    });
}

exports.signupSubmit = function(req, res) {
    // Attempt to sign the user up
    db.insertUser(req.body.username, hashing.hash(req.body.password), req.body.token, success => {
        if (success) { 
            res.render("pages/login", { message: "You have successfully signed up. Please log in." });
        } else {
            res.render("pages/signup", { message: "You have provided an invalid Access Code." });
        }
    });
}
