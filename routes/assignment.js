/**
 * Assignment Router
 */

const db = require("../database");
const router = require("express").Router();
const tmp = require("tmp");
const fs = require("fs");
const { spawn } = require("child_process");


function runPythonCode(code, callback) {
    console.log("Running with code:")
    console.log(code)
    const tempFile = tmp.fileSync();
    fs.writeFileSync(tempFile.name, code);

    const python = spawn("python", [tempFile.name]);
    let output = "";

    python.stdout.on("data", data => {
        output += data.toString();
        console.log(data.toString())
    });

    python.on("close", () => {
        callback(output);
    });
}


router.get("/:id", (req, res, next) => {
    db.getUserAssignments(req.session.userID, (assignments) => {
        if (assignments.length) {
            for (let a in assignments) {
                let assignment = assignments[a];
                if (assignment.ID == req.params.id) {
                    res.render("pages/assignment", { assignment: assignment, code: undefined, console: undefined });
                    return;
                }
            }
            next();
        } else {
            next();
        }
    });
});

router.post("/run", (req, res) => {
    runPythonCode(req.body.code, output => {
        res.render("pages/assignment", { assignment: JSON.parse(req.body.assignment), code: req.body.code, console: output });
    });
});

router.post("/submit", (req, res) => {
    runPythonCode(req.body.code, output => {
        res.render("pages/assignment", { assignment: JSON.parse(req.body.assignment), code: req.body.code, console: output });
    });
});

module.exports = router;
