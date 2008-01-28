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
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserName",
        load: function(data, ioArgs) {
			api.user.userName = data;
        	if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }
        });
		}
		
	this.getUserEmail = function(callback) {
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserEmail",
        load: function(data, ioArgs) {
			api.user.userEmail = data;
        	if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }
        });
		}

	this.getUserID = function(callback)
	{
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserID",
        load: function(data, ioArgs) {
			api.user.userID = data;
	        if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	
	this.userIDToUserName = function(userid, callback)
	{
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserNameFromID&userid="+userid,
        load: function(data, ioArgs) {
			api.user.username = data;
        	if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }
        });
	}
	this.userNameToUserID = function(username, callback)
	{
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserIDFromName&username="+username,
        load: function(data, ioArgs) {
	        api.user.username = data;
	        if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.getUserLevel = function(callback) {
        dojo.xhrGet({
        url: "../backend/api/misc.php?action=getUserLevel",
        load: function(data, ioArgs) {
		    api.user.userLevel = data;
    	    if(callback) { callback(data); }
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); }
        });
	}
}