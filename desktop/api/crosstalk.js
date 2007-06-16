api.crosstalk = new function()
{
    this.checkForEvents = function(callback)
    {
        var url = "../backend/api.php?crosstalk=checkForEvents";
        dojo.io.bind({url: url,
        load: function(type, data, http) { api.crosstalk.eventProcess(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/xml"
        });
    }
    this.sendEvent = function(message, appID)
    {
	var url = "../backend/api.php?crosstalk=sendEvent&message="+message+"&sender=test&appID="+appID;
        dojo.io.bind({url: url,
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/xml"
        });
    }
    this.eventArray = new Array(99,99);
    this.eventProcess = function(type, data, evt, callback)
    {
		var results = data.getElementsByTagName('event');
		for(var i = 0; i<results.length; i++){
		api.crosstalk.eventArray["count"] = i;
		api.crosstalk.eventArray[i] = {};
		api.crosstalk.eventArray[i]["message"] = results[i].firstChild.nodeValue;
		api.crosstalk.eventArray[i]["sender"] = results[i].getAttribute("sender");
		api.crosstalk.eventArray[i]["appID"] = results[i].getAttribute("appID");
		}
        if(callback) { callback() }
        desktop.core.loadingIndicator(1);
	}
}
