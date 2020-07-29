/**
 * Repeat Password Validation
 */

const passwd = document.getElementById("password");
const repeat = document.getElementById("repeat");

passwd.onchange = repeat.onchange = () => {
    if (passwd.value != repeat.value) {
        repeat.setCustomValidity("The passwords do not match.");
    } else {
        repeat.setCustomValidity("");
    }
};
