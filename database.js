const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("database.db");

function init(){
    let userQuery = `CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL
      );`;
    
    db.run(userQuery);
}

exports.insertUser = function(username, password) {
    db.run("INSERT INTO Users(username, password) VALUES(?, ?)", [username, password]);
}

exports.getUsers = function(callback) {
    db.all("SELECT * FROM Users", (err, rows) => {
        callback(rows);
    });
}

init();
