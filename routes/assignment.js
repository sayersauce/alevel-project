/**
 * Assignment Router
 */

const db = require("../database");
const router = require("express").Router();
const tmp = require("tmp");
const fs = require("fs");
const { exec } = require("child_process");


function runPythonCode(code, inputs) {
    return new Promise(resolve => {

        const tempFile = tmp.fileSync();
        const tempInputs = tmp.fileSync();
    
        fs.writeFileSync(tempFile.name, code);
        fs.writeFileSync(tempInputs.name, inputs);
    
        const python = exec(`python ${tempFile.name} < ${tempInputs.name}`);
    
        let output = "";
    
        python.stdin.on("data", data => {
            output += data.toString();
        });
    
        python.stdout.on("data", data => {
            output += data.toString() + "\r";
        });
    
        python.stderr.on("data", data => {
            output += data.toString();
        })
    
        python.on("close", () => {
            output = output.split("\r");

            // Remove \n chars
            let index = output.indexOf("\n");
            while (index > -1) {
                output.splice(index, 1);
                index = output.indexOf("\n");
            }
            
            // Remove "" chars
            index = output.indexOf("");
            while (index > -1) {
                output.splice(index, 1);
                index = output.indexOf("");
            }

            resolve(output);
        });
    
    });
}


router.get("/:id", async (req, res, next) => {
    let assignments = await db.getUserAssignments(req.session.userID);
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

router.post("/run", async (req, res) => {
    const assignment = JSON.parse(req.body.assignment);
    let tests = await db.getAssignmentTests(assignment.ASSIGNMENT);
    let con = {
        title: "Tests",
        passed: 0,
        failed: 0,
        lines: []
    }

    for (let i = 0; i < tests.length; i++) {
        let test = tests[i];
        let codeOutput = await runPythonCode(req.body.code, test.INPUTS);
        let pass = false;

        // Checking if correct outputs are given
        for (let output of [test.OUTPUTS]) {
            if (codeOutput.includes(output)) pass = true;
        }

        if (test.VISIBLE) {
            con.lines = [...con.lines, `Test ${i + 1} with inputs ${test.INPUTS} and expected ouputs ${test.OUTPUTS}:`, ...codeOutput];

            if (pass) con.lines.push("✔️", "");
            else con.lines.push("❌", "");
        }

        if (pass) con.passed++;
        else con.failed++;
    }
    //console.log(consoleOutput)
    res.render("pages/assignment", { assignment: assignment, code: req.body.code, console: con });
});

module.exports = router;
