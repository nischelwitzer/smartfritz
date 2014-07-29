
var fritz = require('smartfritz')
var sleep = require('sleep');

var aid = "12345 4747474";

fritz.getSessionID("user", "password", function(sid){
    console.log("Fritz Connected: "+sid);

	fritz.setSwitchOn(sid, aid, function(settings){
	
		console.log("Power: ON "+aid+" "+settings);
		sleep.sleep(2);
		fritz.setSwitchOff(sid, aid, function(settings){
			// console.log(settings);
			console.log("Power: OFF "+aid+" "+settings);
		});
		
	});
	
});
