/**
 * Admin Page Router
 */

const e = require("express");
const db = require("../database");
const router = require("express").Router();
const python = require("../code");


async function marks() {
    let submissions = await db.getSubmissions();
    let assignments = await db.getAssignments();
    let tests = await db.getTests();
    let titles = [];
    let maxMarks = [];

    for (let a of assignments) {
        titles.push(a.NAME);
        maxMarks.push(tests.filter(el => {
            return el.AssignmentID == a.ID;
        }).length);
    }

    let users = {};

    for (let s of submissions) {
        if (!(s.USERNAME in users)) {
            users[s.USERNAME] = {};
        }

        let user = users[s.USERNAME];
        
        user["FIRSTNAME"] = s.FIRSTNAME;
        user["LASTNAME"] = s.LASTNAME;
        user["CLASS"] = s.CLASS;
        
        for (let title of titles) {
            if (title == s.NAME) {
                if (s.MARK == null) {
                    user[title] = ["#", null];
                } else {
                    user[title] = [(s.MARK).substring(0, (s.MARK).indexOf("/")), s.ID];
                }
            }
        }
    }

    return { titles: titles, maxMarks: maxMarks, users: users };
}


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
    let classes = await db.getClasses();

    res.render("pages/admin/assignments", { users: users, assignments: assignments, classes: classes });
});

router.get("/csv", async (req, res) => {
    // Sending CSV file of all submissions
    let csvData = await marks();
    let csv = `Firstname,Surname,Class,${csvData.titles.join(",")}\n`;
    csv += `,,,${csvData.maxMarks.join(",")}`;

    for (let username in csvData.users) {
        let user = csvData.users[username];
        csv += `\n${user.FIRSTNAME},${user.LASTNAME},${user.CLASS},`

        let i = 0;
        for (let title of csvData.titles) {
            if (title in user) {
                csv += user[title][0];
            }
            if (i < csvData.titles.length - 1) {
                csv += ",";
            }
            i++;
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
    let classAssignments = await db.getAllClassAssignments();

    res.render("pages/admin/tables", { users: users, classes: classes, assignments: assignments, submissions: submissions, tests: tests, classAssignments: classAssignments });
});

router.get("/classes", async (req, res) => {
    let users = await db.getUsers();
    let classes = await db.getClasses();
    let dict = { "admins": [] };

    for (let c of classes) {
        dict[c.NAME] = [];
    }

    for (let u of users) {
        dict[u.CLASS].push(u.USERNAME);
    }

    res.render("pages/admin/classes", { classes: classes, classObj: dict });
});

router.get("/mark-data", async (req, res) => {
    res.json(await marks());
});

router.get("/marks", async (req, res) => {
    res.render("pages/admin/marks");
});

router.get("/assignment/:id", async (req, res) => {
    let assignment = await db.getAssignment(req.params.id);
    let submissions = await db.getSubmissionsForAssignment(req.params.id);

    res.render("pages/admin/assignment", { assignment: assignment, submissions: submissions });
});

router.get("/submission/:id", async (req, res) => {
    let submission = await db.getSubmission(req.params.id);
    let assignment = await db.getAssignmentForSubmission(req.params.id);
    let user = await db.getUserForSubmission(req.params.id);

    res.render("pages/admin/submission", { assignment: assignment, code: assignment.CODE, console: undefined, submission: submission, user: user });
});

router.get("/submissioncode/:id", async (req, res) => {
    let submission = await db.getSubmission(req.params.id);
    res.send(submission.CODE);
});

router.post("/submission/run", async (req, res) => {
    let submission = await db.getSubmission(req.body.submission);
    let assignment = await db.getAssignmentForSubmission(req.body.submission);
    let user = await db.getUserForSubmission(req.body.submission);
    let tests = await db.getTestsForSubmission(req.body.submission);

    let con = await python.testCode(tests, req.body.code);

    assignment.MARK = `${con.passed}/${con.passed+con.failed}`;

    res.render("pages/admin/submission", { assignment: assignment, code: assignment.CODE, console: con, submission: submission, user: user });
});

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

router.post("/assignclass", (req, res) => {
    db.assignToClass(req.body.class, req.body.assignment);
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

router.post("/delclassassignment", (req, res) => {
    db.deleteClassAssignment(req.body.id);
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
