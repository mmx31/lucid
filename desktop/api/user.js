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
        var url = "../backend/api.php?action=getUserName";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserName(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
		}
	this.processGetUserName = function(type, data, evt, callback)
    {
        api.user.userName = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
	this.getUserID = function(callback)
	{
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?action=getUserID";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserID(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.userIDToUserName = function(userid, callback)
	{
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?action=getUserNameFromID&userid="+userid;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processUserIDToUserName(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.userNameToUserID = function(username, callback)
	{
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?action=getUserIDFromName&username="+username;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processUserNameToUserID(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/plain"
        });
	}
	this.processGetUserID = function(type, data, evt, callback)
    {
        api.user.userID = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
	this.processUserIDToUserName = function(type, data, evt, callback)
    {
        api.user.username = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
	this.processUserNameToUserID = function(type, data, evt, callback)
    {
        api.user.username = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
	this.getUserLevel = function(callback) {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?action=getUserID";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.user.processGetUserLevel(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
	this.processGetUserLevel = function(type, data, evt, callback)
    {
        api.user.userLevel = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
}
