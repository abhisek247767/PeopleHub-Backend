const crypto = require('crypto');

function generateVerificationCode() {
    const buffer = crypto.randomBytes(4);  
    const randomValue = buffer.readUInt32BE(0);  
    return (randomValue % 900000) + 100000;  
}

module.exports = generateVerificationCode;
