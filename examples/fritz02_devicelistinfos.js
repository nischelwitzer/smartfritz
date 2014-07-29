
var fritz = require('smartfritz');

fritz.getSessionID("user", "password", function(sid){
  
  console.log("Fritz!Session ID: "+sid);
  fritz.getSwitchList(sid,function(listinfos){
      console.log("Switches AIDs: "+listinfos);
  });

});

