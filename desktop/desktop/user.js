desktop.user = function() {
	this.changeUserPassword(old, newpass, callback) {
		dojo.xhrGet({
        url: "../backend/api/misc.php?action=changePassword&old="+old+"&new="+newpass,
        load: function(data, ioArgs) {
			if(callback) { callback(data); }
     		desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
	}
}