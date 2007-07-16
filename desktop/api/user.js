/** 
* An API that gets user info and such
* TODO: condense this so that the callbacks are not seperate functions. Also document this.
* 
* @classDescription An API that gets user info and such
* @memberOf api
*/
api.user = new function()
{
	this.getUserName = function(callback) {
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserName",
        load: function(data, ioArgs) {
			api.user.userName = data;
        	if(callback) { callback(data); }
        	desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); }
        });
		}

	this.getUserID = function(callback)
	{
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserID",
        load: function(data, ioArgs) {
			api.user.userID = data;
	        if(callback) { callback(data); }
	        desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.userIDToUserName = function(userid, callback)
	{
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserNameFromID&userid="+userid,
        load: function(data, ioArgs) {
			api.user.username = data;
        	if(callback) { callback(data); }
        	desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); }
        });
	}
	this.userNameToUserID = function(username, callback)
	{
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserIDFromName&username="+username,
        load: function(data, ioArgs) {
	        api.user.username = data;
	        if(callback) { callback(data); }
	        desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.getUserLevel = function(callback) {
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserID",
        load: function(data, ioArgs) {
		    api.user.userLevel = data;
    	    if(callback) { callback(data); }
	        desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); }
        });
	}
}