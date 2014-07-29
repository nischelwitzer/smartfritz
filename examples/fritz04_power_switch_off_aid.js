
var fritz = require('smartfritz')

var aid = "12345 4747474";

fritz.getSessionID("user", "password", function(sid){
    console.log(sid);

	fritz.setSwitchOff(sid, aid, function(settings){
		console.log(settings);
	});

});

