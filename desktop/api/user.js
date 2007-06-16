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
	this.processGetUserID = function(type, data, evt, callback)
    {
        api.user.userID = data;
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