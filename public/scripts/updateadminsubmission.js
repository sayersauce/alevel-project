/**
 * Admin Submission View AJAX
 */

const textarea = document.getElementById("text");
const id = document.getElementById("submission").value;

function update() {
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            updateCode(this.responseText)
        }
    };

    xhttp.open("GET", `/admin/submissioncode/${id}`, true);
    xhttp.send();
}

function updateCode(data) {
    if (data.replace(/\s/g, "") !== textarea.innerHTML.replace(/\s/g, "")) {
        textarea.innerHTML = data;
    }
}

update();
setInterval(update, 500);
