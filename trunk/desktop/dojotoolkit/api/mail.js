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
		api.xhr({
			backend: "api.mail.in.listMailboxes",
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
		api.xhr({
			backend: "api.mail.in.getQuota",
			content: this._getArgs(),
			handleAs: "json",
			load: callback
		});
	},
	countMessages: function(mode, callback) {
		api.xhr({
			backend: "api.mail.in.countMessages",
			content: this._getArgs({
				mode: mode || "ALL"
			}),
			handleAs: "json",
			load: callback
		});
	},
	createFolder: function(name, callback) {
		api.xhr({
			backend: "api.mail.in.createFolder",
			content: this._getArgs({
				folder: name
			}),
			load: function(data) {
				callback(data == "0");
			}
		});
	},
	deleteFolder: function(name) {
		api.xhr({
			backend: "api.mail.in.deleteFolder",
			content: this._getArgs({
				folder: name
			}),
			load: function(data) {
				callback(data == "0");
			}
		});
	},
	renameFolder: function(from, to, callback) {
		api.xhr({
			backend: "api.mail.in.renameFolder",
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
		api.xhr({
			backend: "api.mail.in.listFolder",
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

dojo.require("dojox.grid._data.model");
dojo.declare("api.mail.gridModel", dojox.grid.data.Dynamic, {
	constructor: function(mailClass, mailbox) {
		this.mailClass = mailClass;
		this.mailbox = mailbox;
	},
	getRowCount: function(){
		api.xhr({
			backend: "api.mail.in.countMessages",
			content: this.mailClass._getArgs({
				mode: "ALL"
			}),
			sync: true,
			handleAs: "json",
			load: dojo.hitch(this, function(data) {
				this.count = data[this.mailbox] || 0;
			})
		});
		return this.count;
	},
	requestRows: function(inRowIndex, inCount){
		inRowIndex--;
		api.xhr({
			backend: "api.mail.in.listFolder",
			content: this.mailClass._getArgs({
				mailbox: this.mailbox,
				start: inRowIndex,
				end: inRowIndex + inCount
			}),
			load: dojo.hitch(this, function(data) {
				for(item in data) { this.setRow(data[item], parseInt(item)+1); }
			}),
			handleAs: "json"
		});
	}
});