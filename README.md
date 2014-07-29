# smartfritz

Node module to communicate with a AVM FritzBox and FRITZ!DECT 200 (smart home hardware) providing the following functions:

- Get the session ID (getSessionID)
- Get the switch (FRITZ!DECT 200) State (getSwitchState)
- Set the switch (FRITZ!DECT 200) ON (setSwitchOn)
- Set the switch (FRITZ!DECT 200) OFF (setSwitchOff)
- Get the switch (FRITZ!DECT 200) Power (getSwitchPower)
- Get the switch (FRITZ!DECT 200) Energy (getSwitchEnergy)
- Get the switch (FRITZ!DECT 200) List (getSwitchList)
- Get the DeviceListInfos (FRITZ!DECT 200) as XML (getDeviceListInfos) >FritzOS 6.10
- Get the phone list (getPhoneList)
- Set the guest wlan (setGuestWLan)
- Get the guest wlan settings (getGuestWLan)

correction of package.json with main for "out of the box" function.

For AVM FRITZ!DECT 200  control you need to know your Actuator identification number (AIN)

## Install

```bash
npm install smartfritz
```

## Testing the Examples

```bash
node fritz02_devicelistinfos.js

Output similar to:
Fritz!Session ID: 171775fcb855bc17
Switches AIDs: 087610087001,087510717012,087610101971
```

## How to use

Get the session ID default:
as URL "fritz.box" is used as default paramter
```js
var fritz = require('smartfritz');

fritz.getSessionID("user", "password", function(sid){
    console.log(sid);
});
```


Get the session ID with own URL:
use your Fritz!Box IP when "fritz.box" is not working.
```js
var fritz = require('smartfritz');

var moreParam = { url:"192.168.178.1" };
fritz.getSessionID("user", "password", function(sid){
    console.log(sid);
}, moreParam);
```

Get the Switch AID List:
```js
var fritz = require('smartfritz');

fritz.getSessionID("user", "password", function(sid){
  
  console.log("Fritz!Session ID: "+sid);
  fritz.getSwitchList(sid,function(listinfos){
      console.log("Switches AIDs: "+listinfos);
  });

});
```


Get the switch Power (FRITZ!DECT 200):
```js
var fritz = require('smartfritz');

fritz.getSwitchPower(sid, aid, function(sid){
    console.log(sid);
});
```

Get the switch Energy (FRITZ!DECT 200):
```js
var fritz = require('smartfritz');

fritz.getSwitchEnergy(sid, aid, function(sid){
    console.log(sid);
});
```

Get the switch State (DECT200):
```js
var fritz = require('smartfritz');

fritz.getSwitchState(sid, aid, function(sid){
    console.log(sid);
});
```

Set the switch State ON (DECT200):
```js
var fritz = require('smartfritz');

fritz.setSwitchOn(sid, aid, function(sid){
    console.log(sid);
});
```

Set the switch State OFF (DECT200):
```js
var fritz = require('smartfritz');

fritz.setSwitchOff(sid, aid, function(sid){
    console.log(sid);
});
```

Get the phone list:
```js
var fritz = require('smartfritz');

fritz.getPhoneList(sid,function(calls){
    console.log(calls);
});

```

Enable or disable guest wlan:
```js
var fritz = require('smartfritz');

fritz.setGuestWLan(sid, true, function(enabled){
    console.log("Guest WLan Enabled: "+enabled);
});
```

Get guest wlan settings:
```js
var fritz = require('smartfritz');

fritz.getGuestWLan(sid, function(settings){
    console.log(settings);
});
```

## AHA-HTTP Interface

AHA - Avm Home Interface

https://fritz.box/webservices/homeautoswitch.lua?ain=<ain>&switchcmd=<cmd>&sid=<sid>

AHA-HTTP-Interface document 
http://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AHA-HTTP-Interface.pdf

## Thanks to // Code base from:

* steffen.timm for the basic communication function
* thk4711 for the FRITZ!DECT 200 codes 
* AVM for providing the good AHA-HTTP-Interface document 


