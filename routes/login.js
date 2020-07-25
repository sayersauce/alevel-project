/**
 * Login and Sign Up Routes
 */

const db = require("../database");

exports.login = function(req, res) {
    res.render("pages/login");
}

exports.signup = function(req, res) {
    res.render("pages/signup");
}

exports.loginSubmit = function(req, res) {
    res.send(req.body);
}

exports.signupSubmit = function(req, res) {
    db.insertUser(req.body.username, req.body.password, req.body.token, success => {
        if (success) {
            res.send("You have successfully signed up");
        } else {
            res.send("You have provided an invalid access code");
        }
    });
}
