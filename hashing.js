const bcrypt = require("bcrypt");

function hash(pass) {
    return bcrypt.hashSync(pass, 10);
}

function check(pass, passHash) {
    return bcrypt.compareSync(pass, passHash);
}

module.exports = {hash, check};
