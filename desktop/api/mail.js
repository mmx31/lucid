dojo.provide("api.mail");

dojo.declare("api.mail", null, {
	constructor: function(params) {
		if(!params) params = {};
		if(!params.rootdir) params.rootdir = "/";
		dojo.forEach(["host", "username", "password", "protocol", "rootdir"], function(item) {
			this[item] = params[item] || "";
		}, this);
	},
	listMailboxes: function(callback) {
		dojo.xhrPost({
			url: desktop.core.backend("api.mail.in.listMailboxes"),
			content: this._getArgs(),
			handleAs: "json",
			load: dojo.hitch(this, function(data, ioArgs) {
				this._folderCache = data;
				callback(data);
			})
		});
	},
	_getArgs: function(obj) {
		if(!obj) obj = {};
		dojo.forEach(["host", "username", "password", "protocol", "rootdir"], function(item) {
			obj[item] = this[item];
		}, this);
		return obj;
	},
	getQuota: function(callback) {
		dojo.xhrPost({
			url: desktop.core.backend("api.mail.in.getQuota"),
			content: this._getArgs(),
			handleAs: "json",
			load: callback
		});
	},
	countMessages: function(mode, callback) {
		dojo.xhrPost({
			url: desktop.core.backend("api.mail.in.countMessages"),
			content: this._getArgs({
				mode: mode || "ALL"
			}),
			handleAs: "json",
			load: callback
		});
	},
	createFolder: function(name, callback) {
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
	deleteFolder: function(name) {
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
	renameFolder: function(from, to, callback) {
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
	},
	listFolder: function(args) {
		dojo.xhrPost({
			url: desktop.core.backend("api.mail.in.listFolder"),
			content: this._getArgs({
				mailbox: args.folder || (this._folderCache[0] || "INBOX"),
				start: args.start || 1,
				end: args.end || 20
			}),
			load: args.callback,
			handleAs: "json"
		});
	},
	destroy: function() {
		dojo.forEach(["host", "username", "password", "protocol", "rootdir"], function(item) {
			this[item] = null;
		}, this);
		//to protect the user's information
	}
});
