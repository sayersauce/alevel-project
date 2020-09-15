/**
 * Admin Page Router
 */

const db = require("../database");
const router = require("express").Router();

router.use((req, res, next) => {
    // Verify that the user is an admin
    if (req.session.admin) {
        next();
    } else {
        // If not redirect them to the homepage
        res.redirect("/");
    }
});

router.get("/", async (req, res) => {
    let users = await db.getUsers();
    let classes = await db.getClasses();
    let assignments = await db.getAssignments();
    let submissions = await db.getSubmissions();
    let tests = await db.getTests();

    res.render("pages/admin", { users: users, classes: classes, assignments: assignments, submissions: submissions, tests: tests });

});

router.get("/assignments", async (req, res) => {
    let users = await db.getUsers();
    let assignments = await db.getAssignments();

    res.render("pages/admin/assignments", { users: users, assignments: assignments });
})

router.post("/createtoken", (req, res) => {
    db.createToken(req.body.className);
    res.redirect("/admin");
});

router.post("/createassignment", (req, res) => {
    db.createAssignment(req.body.title, req.body.desc, req.body.hints, req.session.userID, req.body.startCode, req.body.testCode, new Date(req.body.date).toISOString());
    res.redirect("/admin");
});

router.post("/createtest", (req, res) => {
    db.createTest(req.body.assignment, req.body.inputs, req.body.outputs, !!req.body.visible);
    res.redirect("/admin");
});

router.post("/assignuser", (req, res) => {
    db.assignToUser(req.body.user, req.body.assignment);
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

router.post("/delassignment", (req, res) => {
    db.deleteAssignment(req.body.id);
    res.redirect("/admin");
});

router.post("/deltest", (req, res) => {
    db.deleteTest(req.body.id);
    res.redirect("/admin");
});

module.exports = router;
