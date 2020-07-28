/**
 * Admin Page Router
 */

const db = require("../database");
const router = require("express").Router();

router.use((req, res, next) => {
    // admin middleware here
    next()
});

router.get("/", (req, res) => {
    db.getUsers(users => {
        db.getClasses(classes => {
            res.render("pages/admin", { users: users, classes: classes });
        });
    });
});

router.post("/deluser", (req, res) => {
    let id = req.body.id;
    db.deleteUser(id);
    res.redirect("/admin");
});

router.post("/deltoken", (req, res) => {
    let token = req.body.token;
    db.deleteToken(token);
    res.redirect("/admin");
});

module.exports = router;
