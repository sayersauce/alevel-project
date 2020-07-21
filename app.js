/**
 * Computer Science Project
 */

const express = require("express");
const app = express();
const port = 80;

const site = require("./site");
const db = require("./database");

// Config

app.use(express.static("public"))
app.set("view engine", "ejs");

// Routing

app.get("/", site.index);

// Startup

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
