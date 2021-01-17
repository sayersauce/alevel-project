/**
 * Admin Marks Page AJAX
 */

const table = document.getElementById("table");
const timer = document.getElementById("timer");

let receivedAt = null;

function update() {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            updateTable(this.responseText)
        }
    };

    xhttp.open("GET", "/admin/mark-data", true);
    xhttp.send();
}

function updateTable(data) {

    receivedAt = new Date();
    json = JSON.parse(data);
    titleHTML = "";
    marksHTML = "";
    userHTML = "";

    for (let title of json.titles) {
        titleHTML += "<th>" + title + "</th>";
    }

    for (let mark of json.maxMarks) {
        marksHTML += "<td>" + mark + "</td>";
    }

    for (let id in json.users) {
        let user = json.users[id];

        assignmentRows = "";

        for (let title of json.titles) {
            if (title in user) {
                assignmentRows += "<td>" + user[title] + "</td>";
            } else {
                assignmentRows += "<td>unassigned</td>";
            }
        }

        userHTML += `
        <tr>
            <td>${user.FIRSTNAME}</td>
            <td>${user.LASTNAME}</td>
            <td>${user.CLASS}</td>
            ${assignmentRows}
        </tr>
        `
    }

    table.innerHTML = `
    <tr>
        <th>Firstname</th>
        <th>Surname</th>
        <th>Class</th>
        ${titleHTML}
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        ${marksHTML}
    </tr>
    ${userHTML}
    `


}

function timestamp() {
    if (receivedAt != null) {
        timer.innerText = "Updated " + Math.ceil(Math.abs(new Date() - receivedAt) / (1000)) + " second(s) ago.";
    }
}

update();
setInterval(update, 2000);
setInterval(timestamp, 1000);
