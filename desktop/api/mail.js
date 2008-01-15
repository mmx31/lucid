dojo.provide("api.mail");

dojo.declare("api.mail", null, {
	constructor: function(params) {
		if(!params) params = {};
		dojo.forEach(["host", "username", "password", "protocol"], function(item) {
			this[item] = params[item];
		}, this);
	},
	listMailboxes: function(callback) {
		dojo.xhrPost({
			url: desktop.core.backend("api.mail.in.listMailboxes"),
			content: this._getArgs(),
			handleAs: "JSON",
			load: callback
		});
	},
	_getArgs: function(obj) {
		if(!obj) obj = {};
		dojo.forEach(["host", "username", "password", "protocol"], function(item) {
			obj[item] = this[item];
		}, this);
		return obj;
	},
	folder: {
		create: function(name, callback) {
			dojo.xhrPost({
				url: desktop.core.backend("api.mail.in.createFolder"),
				content: this._getArgs({
					folder: name
				}),
				load: function(data) {
					callback(data == "0");
				}
			});
		},
		remove: function(name) {
			dojo.xhrPost({
				url: desktop.core.backend("api.mail.in.deleteFolder"),
				content: this._getArgs({
					folder: name
				}),
				load: function(data) {
					callback(data == "0");
				}
			});
		},
		rename: function(from, to, callback) {
			dojo.xhrPost({
				url: desktop.core.backend("api.mail.in.renameFolder"),
				content: this._getArgs({
					from: from,
					to: to
				}),
				load: function(data) {
					callback(data == "0");
				}
			});
		}
	},
	destroy: function() {
		dojo.forEach(["host", "username", "password", "protocol"], function(item) {
			this[item] = null;
		}, this);
		//to protect the user's information
	}
});
