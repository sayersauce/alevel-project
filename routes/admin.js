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
    res.render("pages/admin");
});

router.get("/assignments", async (req, res) => {
    let users = await db.getUsers();
    let assignments = await db.getAssignments();

    res.render("pages/admin/assignments", { users: users, assignments: assignments });
});

router.get("/csv", async (req, res) => {
    // Sending CSV file of all submissions
    let submissions = await db.getSubmissions();
    let assignments = await db.getAssignments();
    let assignmentTitles = [];

    for (let a of assignments) {
        assignmentTitles.push(a.NAME);
    }

    let csv = "Firstname,Surname,Class," + assignmentTitles.join();

    for (let s of submissions) {
        csv += "\n" + [s.FIRSTNAME,s.LASTNAME,s.CLASS].join() + ",";
        for (let title of assignmentTitles) {
            if (title == s.NAME) {
                csv += s.MARK + ",";
            } else {
                csv += ",";
            }
        }
    }

    res.attachment("marks.csv").send(csv);
});

router.get("/tables", async (req, res) => {
    let users = await db.getUsers();
    let classes = await db.getClasses();
    let assignments = await db.getAssignments();
    let submissions = await db.getSubmissions();
    let tests = await db.getTests();

    res.render("pages/admin/tables", { users: users, classes: classes, assignments: assignments, submissions: submissions, tests: tests });
});

router.get("/classes", async (req, res) => {
    let users = await db.getUsers();
    let classes = await db.getClasses();
    let dict = {};

    for (let c of classes) {
        dict[c.NAME] = [];
    }

    for (let u of users) {
        dict[u.CLASS].push(u.USERNAME);
    }

    res.render("pages/admin/classes", { classes: classes, classObj: dict });
});

router.get("/assignments", async (req, res) => {
    let users = await db.getUsers();
    let assignments = await db.getAssignments();

    res.render("pages/admin/assignments", { users: users, assignments: assignments });
});

router.get("/assignment/:id", async (req, res) => {
    let assignment = await db.getAssignment(req.params.id);
    let submissions = await db.getSubmissionsForAssignment(req.params.id);

    res.render("pages/admin/assignment", { assignment: assignment, submissions: submissions });
})

router.post("/createtoken", (req, res) => {
    db.createToken(req.body.className);
    res.redirect("/admin/classes")
});

router.post("/createassignment", (req, res) => {
    db.createAssignment(req.body.title, req.body.desc, req.body.hints, req.session.userID, req.body.startCode, req.body.testCode, new Date(req.body.date).toISOString());
    res.redirect("/admin/assignments");
});

router.post("/createtest", (req, res) => {
    db.createTest(req.body.assignment, req.body.inputs, req.body.outputs, !!req.body.visible);
    res.redirect("/admin/assignments");
});

router.post("/assignuser", (req, res) => {
    db.assignToUser(req.body.user, req.body.assignment);
    res.redirect("/admin/assignments");
});

router.post("/deluser", (req, res) => {
    db.deleteUser(req.body.id);
    res.redirect("/admin/tables");
});

router.post("/deltoken", (req, res) => {
    db.deleteToken(req.body.token);
    res.redirect("/admin/tables");
});

router.post("/delassignment", (req, res) => {
    db.deleteAssignment(req.body.id);
    res.redirect("/admin/tables");
});

router.post("/deltest", (req, res) => {
    db.deleteTest(req.body.id);
    res.redirect("/admin/tables");
});

module.exports = router;
