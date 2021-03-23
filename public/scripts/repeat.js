/**
 * Repeat Password Validation
 */

const passwd = document.getElementById("password");
const repeat = document.getElementById("repeat");

// Everytime a character is typed into the password input, run this function
passwd.onchange = repeat.onchange = () => {
    if (passwd.value != repeat.value) {
        // If the passwords do not match, display a warning
        repeat.setCustomValidity("The passwords do not match.");
    } else {
        // Otherwise, display nothing
        repeat.setCustomValidity("");
    }
};
