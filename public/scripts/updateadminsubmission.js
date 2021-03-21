/**
 * Admin Submission View AJAX
 */

const textarea = document.getElementById("text");
const id = document.getElementById("submission").value;

// Send AJAX request to get user code
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

// Update ide with code from the request
function updateCode(data) {
    // Remove additional whitespace characters
    if (data.replace(/\s/g, "") !== textarea.innerHTML.replace(/\s/g, "")) {
        textarea.innerHTML = data;
    }
}

// Request code when the page first loads
update();
// Request code every half-second
setInterval(update, 500);
