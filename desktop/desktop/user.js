desktop.user = new function() {
	this.changeUserPassword = function(obj) {
		dojo.xhrGet({
        url: "../backend/api/misc.php?action=changePassword&old="+obj.old+"&new="+obj.newpass,
        load: function(data, ioArgs) {
			if(obj.callback) { obj.callback(data); }
     		desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
	this.changeUserEmail = function(obj) {
		dojo.xhrPost({
        url: "../backend/api/misc.php?action=changeEmail",
		content: {
			pass: obj.old,
			email: obj.newemail
		},
        load: function(data, ioArgs) {
			if(obj.callback) { obj.callback(data); }
     		desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.log("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
}