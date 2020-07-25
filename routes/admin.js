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
