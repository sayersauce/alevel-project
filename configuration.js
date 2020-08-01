/**
 * Configuration File Generator
 */

const fs = require("fs");

exports.init = () => {
    const configTemplate = {
        "app": {
            "port": 80,
            "secret": ""
        },
        "email": {
            "service": "",
            "name": "",
            "user": "",
            "pass": ""
        }
    };
    
    try {
        fs.writeFileSync("./config.json", JSON.stringify(configTemplate), { flag: "wx" });
        console.log("A config.json file has been created, please fill in the options and restart the program.")
        process.exit();
    } catch {
        console.log("config.json loaded");
    }
}
