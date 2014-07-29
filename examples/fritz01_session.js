var fritz = require('smartfritz');

fritz.getSessionID("user", "password", function(sid){
    console.log(sid);
});
