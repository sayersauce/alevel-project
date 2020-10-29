/**
 * Login and Sign Up Routes
 */

const db = require("../database");
const hashing = require("../hashing");
const email = require("../email");
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

router.get("/forgot", (req, res) => {
    res.render("pages/forgottenpass", { message: undefined });
});

router.get("/change", (req, res) => {
    res.render("pages/changepass", { message: undefined });
});

router.post("/login", async (req, res) => {
    // Attempt to log the user in
    let user = await db.getUser(req.body.username);
    if (user && hashing.check(req.body.password, user.PASSWORD)) {
        db.loginUser(req.body.username);
        req.session.username = user.USERNAME;
        req.session.firstname = user.FIRSTNAME;
        req.session.userID = user.ID;
        req.session.admin = user.CLASS == "admins";
        res.redirect("/");
    } else {
        res.render("pages/login", { message: "You have provided an incorrect username or password." });
    }
});

router.post("/signup", async (req, res) => {
    // Attempt to sign the user up
    let success = await db.insertUser(req.body.email, req.body.firstname, req.body.lastname, hashing.hash(req.body.password), req.body.token);
    if (success) { 
        res.render("pages/login", { message: "You have successfully signed up. Please log in." });
    } else {
        res.render("pages/signup", { message: "You have provided an invalid Access Code." });
    }
});

router.post("/forgot", async (req, res) => {
    // Attempt to send an email to the user who has forgotten their password
    let user = await db.getUser(req.body.email);
    if (user) {
        let password = db.createNewPassword(user.USERNAME);
        email.sendEmail(user.EMAIL, "New Password", `Hello ${user.USERNAME} your new password is ${password}.`)
    }
    res.render("pages/login", { message: "If the email you have provided exists in our database, we have sent you a new password." })
});

router.post("/change", async (req, res) => {
    // Attempt to change a user's password
    let user = await db.getUser(req.body.username);
    if (user && hashing.check(req.body.oldpassword, user.PASSWORD)) {
        db.updatePassword(user.USERNAME, hashing.hash(req.body.password));
        res.render("pages/login", { message: "You have successfully changed your password." });
    } else {
        res.render("pages/changepass", { message: "You have provided an incorrect username or password." });
    }
});

module.exports = router;
