var crypto = require('crypto');
var mysalt = "thisiswebhack";

module.exports = (password)=>{
return crypto.createHash('sha512').update(password + mysalt).digest('base64');
};