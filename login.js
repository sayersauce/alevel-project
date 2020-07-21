/**
 * Login and Sign Up Routes
 */

exports.login = function(req, res) {
    res.render("pages/login");
}

exports.signup = function(req, res) {
    res.render("pages/signup");
}

exports.loginSubmit = function(req, res) {
    console.log(req.body);
    res.send(req.body);
}

exports.signupSubmit = function(req, res) {
    console.log(req.body);
    res.send(req.body);
}
