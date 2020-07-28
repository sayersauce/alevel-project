/**
 * Login and Sign Up Routes
 */

const db = require("../database");

exports.login = function(req, res) {
    res.render("pages/login", { message: undefined });
}

exports.signup = function(req, res) {
    res.render("pages/signup", { message: undefined });
}

exports.loginSubmit = function(req, res) {
    // Attempt to log the user in
    db.getUser(req.body.username, user => {
        if (user) {
            db.loginUser(req.body.username);
            req.session.username = user.USERNAME;
            res.redirect("/");
        } else {
            res.render("pages/login", { message: "Incorrect username or password provided." });
        }
    });
}

exports.signupSubmit = function(req, res) {
    // Attempt to sign the user up
    db.insertUser(req.body.username, req.body.password, req.body.token, success => {
        if (success) { 
            res.render("pages/login", { message: "You have successfully signed up. Please log in." });
        } else {
            res.render("pages/signup", { message: "Invalid Access Token provided." });
        }
    });
}
