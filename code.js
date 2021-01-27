/**
 * Python Code Execution Functions
 */

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

async function testCode(tests, code) {
    let con = {
        title: "Tests",
        passed: 0,
        failed: 0,
        lines: []
    }

    for (let i = 0; i < tests.length; i++) {
        let test = tests[i];
        let codeOutput = await runPythonCode(code, test.INPUTS);
        let pass = false;

        cOut = codeOutput.join("").replace(/\s/g, "");
        tOut = test.OUTPUTS.replace(/\s/g, "");

        pass = cOut == tOut;

        /*
        // Checking if correct outputs are given
        for (let output of [test.OUTPUTS]) {
            for (let line of codeOutput) {
                if (line.includes(output)) pass = true;
            }
        }
        */

        if (test.VISIBLE) {
            con.lines = [...con.lines, `Test ${i + 1} with inputs ${test.INPUTS} and expected ouputs ${test.OUTPUTS}:`, ...codeOutput];

            if (pass) con.lines.push("✔️", "");
            else con.lines.push("❌", "");
        }

        if (pass) con.passed++;
        else con.failed++;
    }

    return con;
}

module.exports = {runPythonCode, testCode};
