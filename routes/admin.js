/**
 * Admin Page Route
 */

const db = require("../database");

exports.admin = function(req, res) {
    db.getUsers(users => {
        db.getClasses(classes => {
            res.render("pages/admin", { users: users, classes: classes });
        });
    });
}

exports.delUser = function(req, res) {
    let id = req.body.id;
    db.deleteUser(id);
    res.redirect("/admin");
}

exports.delToken = function(req, res) {
    let token = req.body.token;
    db.deleteToken(token);
    res.redirect("/admin");
}
