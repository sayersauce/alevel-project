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

router.post("/createtoken", (req, res) => {
    db.createToken(req.body.className);
    res.redirect("/admin");
});

router.post("/deluser", (req, res) => {
    db.deleteUser(req.body.id);
    res.redirect("/admin");
});

router.post("/deltoken", (req, res) => {
    db.deleteToken(req.body.token);
    res.redirect("/admin");
});

module.exports = router;
