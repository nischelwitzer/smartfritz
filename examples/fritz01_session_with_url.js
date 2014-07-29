// session ID with URL object passing
// normal URL: "fritz.box" is used

var fritz = require('smartfritz');

var moreParam = { url:"192.168.178.1" };
fritz.getSessionID("user", "password", function(sid){
    console.log(sid);
}, moreParam);

