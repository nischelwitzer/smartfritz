
/**
* smartFritz - Fritz goes smartHome
* AVM SmartHome nodeJS Control - for AVM Fritz!Box and Dect200 Devices 
* nischi - first version: July 2014
*
* based on: Node2Fritz by steffen.timm on 05.12.13 for Fritz!OS > 05.50
* and  thk4711 (code https://github.com/pimatic/pimatic/issues/38)
* Documentation is at http://www.avm.de/de/Extern/files/session_id/AHA-HTTP-Interface.pdf
 */
 
var http = require('http');
var querystring = require('querystring');

// #############################################################################

module.exports.getSessionID = function(username, password, callback, options)
{
    if (typeof username != 'string') throw new Error('Invalid username');
    if (typeof password != 'string') throw new Error('Invalid password');

    options || (options = {});
    options.url || (options.url = 'fritz.box');

    var sessionID = "";
    try {

        http.request({host:options.url, path:'/login_sid.lua'}, function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {

                var challenge = str.match("<Challenge>(.*?)</Challenge>")[1];
                http.request({host:options.url, path:"/login_sid.lua?username=" + username + "&response="+challenge+"-" + require('crypto').createHash('md5').update(Buffer(challenge+'-'+password, 'UTF-16LE')).digest('hex')},function(response){
                    var str = '';
                    response.on('data', function (chunk) {
                        str += chunk;
                    });
                    response.on('end', function () {
                        sessionID = str.match("<SID>(.*?)</SID>")[1];
                        callback(sessionID);
                    })
                }).end();
            });
        }).end();
    } catch (e) {
        throw new Error('Error getting sid from FritzBox. Please check login and url');
    }
};

// #############################################################################
// #############################################################################

module.exports.setGuestWLan = function(sid, enable, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');


    http.request({host:options.url, path:'/wlan/guest_access.lua?sid='+sid},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            options.ssid || (options.ssid = /"wlan:settings\/guest_ssid"\] = "([^"]*)"/g.exec(data)[1]);
            options.wpakey || (options.wpakey = /"wlan:settings\/guest_pskvalue"\] = "([^"]*)"/g.exec(data)[1]);
            options.security || (options.security = "0");
            options.modus || (options.modus = /"wlan:settings\/guest_encryption"\] = "([^"]*)"/g.exec(data)[1]);
            options.timeout || (options.timeout = /"wlan:settings\/guest_timeout"\] = "([^"]*)"/g.exec(data)[1]);
            options.timeoutactive || (options.timeoutactive = /"wlan:settings\/guest_timeout_active"\] = "([^"]*)"/g.exec(data)[1]);

            var parameters = {
                "guest_ssid":options.ssid,
                "wlan_security":options.security,
                "wpa_key":options.wpakey,
                "wpa_modus":options.modus,
                "down_time_activ":options.timeoutactive,
                "down_time_value":options.timeout,
                "btnSave":""};

            if (enable)
            {
                parameters.activate_guest_access = "on";
            }
            var post_data = querystring.stringify(parameters);
            var post_req = http.request({host:options.url, path:'/wlan/guest_access.lua?sid='+sid, method: 'POST',headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }},function(response){
                var data = '';

                response.on('data', function (chunk) {
                    data += chunk;
                });
                response.on('end', function () {

                    http.request({host:options.url, path:'/wlan/guest_access.lua?sid='+sid},function(response){
                        var data = '';

                        response.on('data', function (chunk) {
                            data += chunk;
                        });
                        response.on('end', function () {
                            callback(/"wlan:settings\/guest_ap_enabled"\] = "([^"]*)"/g.exec(data)[1]=="1");
                        });
                    }).end();
                });
            });
            post_req.write(post_data);
            post_req.end();
        });
    }).end();
};


module.exports.getGuestWLan = function(sid, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/wlan/guest_access.lua?sid='+sid},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var settings = {};
            settings.enabled = /"wlan:settings\/guest_ap_enabled"\] = "([^"]*)"/g.exec(data)[1]=="1";
            settings.ssid = /"wlan:settings\/guest_ssid"\] = "([^"]*)"/g.exec(data)[1];
            settings.wpakey = /"wlan:settings\/guest_pskvalue"\] = "([^"]*)"/g.exec(data)[1];
            settings.security = "0";
            settings.modus = /"wlan:settings\/guest_encryption"\] = "([^"]*)"/g.exec(data)[1];
            settings.timeout = /"wlan:settings\/guest_timeout"\] = "([^"]*)"/g.exec(data)[1];
            settings.timeoutactive = /"wlan:settings\/guest_timeout_active"\] = "([^"]*)"/g.exec(data)[1];

            callback(settings);
        });
    }).end();
};


module.exports.getPhoneList = function(sid, callback, options)
{

    options || (options = {});
    options.url || (options.url = 'fritz.box');
    try {
        http.request({host:options.url, path:'/fon_num/foncalls_list.lua?sid='+sid+'&csv='},function(response){
            var csv = '';

            response.on('data', function (chunk) {
                csv += chunk;
            });
            response.on('end', function () {
                var correctedCsv = csv.replace(/.*/, "").substr(1);
                correctedCsv = correctedCsv.replace(/(\n.{10}) /g,"$1;");
                correctedCsv = correctedCsv.replace(/\n1;/g,"\ninbound;");
                correctedCsv = correctedCsv.replace(/\n2;/g,"\nmissed;");
                correctedCsv = correctedCsv.replace(/\n3;/g,"\ndeclined;");
                correctedCsv = correctedCsv.replace(/\n4;/g,"\noutbound;");
                correctedCsv = correctedCsv.replace(/.*/, "").substr(1);
                correctedCsv = correctedCsv.replace(/Internet: /g,"");

                var lines = correctedCsv.split("\n");
                var json = "[";
                for(line in lines)
                {
                    json = json + "{";
                    var values = lines[line].split(";");
                    json = json + '"direction":"'+values[0]+'",';
                    json = json + '"date":"'+values[1]+'",';
                    json = json + '"time":"'+values[2]+'",';
                    json = json + '"remotename":"'+values[3]+'",';
                    json = json + '"remotenumber":"'+values[4]+'",';
                    json = json + '"localdevice":"'+values[5]+'",';
                    json = json + '"localnumber":"'+values[6]+'",';
                    json = json + '"duration":"'+values[7]+'"';
                    json = json + "}";
                    if (line == lines.length - 2)
                        break;
                    json = json + ",";
                }
                json = json + "]";
                callback(eval(json));
            });
        }).end();
    } catch (e) {
        throw new Error('Error getting phone list from FritzBox. Please check session');
    }
};

// #############################################################################

// check if your session id is OK
module.exports.checkSession = function(sid, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    try {

        http.request({host:options.url, path:'/login_sid.lua?sid='+sid}, function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                callback(str.match("<SID>(.*?)</SID>")[1] == sid);
            });
        }).end();
    } catch (e) {
        throw new Error('Error getting sid from FritzBox. Please check login and url');
    }
};

// #############################################################################
// #############################################################################

module.exports.getSwitchState = function(sid, ain, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=getswitchstate&ain='+ain},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var state = '';
            state = data.trim()
            callback(state);
        });
    }).end();
};

// turn an outlet on
// returns the state the outlet was set to
module.exports.setSwitchOn = function(sid, ain, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=setswitchon&ain='+ain},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var state = '';
            state = data.trim()
            callback(state);
        });
    }).end();
};

// turn an outlet off
// returns the state the outlet was set to
module.exports.setSwitchOff = function(sid, ain, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=setswitchoff&ain='+ain},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var state = '';
            state = data.trim()
            callback(state);
        });
    }).end();
};

// get the total enery consumption of an outlet since it was tuned on the first time or since the counter was reset
// returns the value in Wh
module.exports.getSwitchEnergy = function(sid, ain, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=getswitchenergy&ain='+ain},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var energy = 'OK';
            energy = data.trim()
            callback(energy);
        });
    }).end();
};

// get the current enery consumption of an outlet
// returns the value in mW
module.exports.getSwitchPower = function(sid, ain, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=getswitchpower&ain='+ain},function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var energy = 'OK';
            energy = data.trim()
            callback(energy);
        });
    }).end();
};

// get the device list infos with details - for ALL smart home devices
// no answer till now - wait for fritz box update ?!?
module.exports.getDeviceListInfos = function(sid, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=getdevicelistinfos'},
	function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var xmlinfo = 'OK';
            xmlinfo = data.trim()
            callback(xmlinfo);
        });
    }).end();
};

// get the switch list
module.exports.getSwitchList = function(sid, callback, options)
{
    options || (options = {});
    options.url || (options.url = 'fritz.box');

    http.request({host:options.url, path:'/webservices/homeautoswitch.lua?sid='+sid+'&switchcmd=getswitchlist'},
	function(response){
        var data = '';

        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            var switchlist = 'OK';
            switchlist = data.trim()
            callback(switchlist);
        });
    }).end();
};

// #############################################################################
// #############################################################################

