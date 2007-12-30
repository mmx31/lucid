dojo.require("dojo.io.iframe");
/** 
* An API that interacts with the filesystem
* TODO: document this. Also condense it so all the callbacks are not seperate functions.
* 
* @classDescription An API that interacts with the filesystem
* @memberOf api
*/
api.fs = new function()
{ 
   this.ls = function(object)
    {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.getFolder"),
		content: {
			path: object.path
		},
		handleAs: "xml",
        load: function(data, ioArgs) {
			var results = data.getElementsByTagName('file');
			if (api.fs.lsArray) {
				delete api.fs.lsArray;
			}
			api.fs.lsArray = [];
			for(var i = 0; i<results.length; i++){
			api.fs.lsArray[i] = new Object();
			if(results[i].getAttribute("type") == "folder") {
			api.fs.lsArray[i].isDir = true;
			}
			else {
			api.fs.lsArray[i].isDir = false;
			}
			api.fs.lsArray[i].file = results[i].firstChild.nodeValue;
			}
	        if(object.callback) { object.callback(api.fs.lsArray); }
        	desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.read = function(object)
    {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.getFile"),
		content: {
			path: object.path
		},
		handleAs: "xml",
        load: function(data, ioArgs) {
			if(!data) { if(object.onError) { object.onError(); } else { api.ui.alertDialogDialog({title: "Error", message: "Sorry! We couldn't open \""+object.path+"\". Check the file exists and try again."}); } }
			var results = data.getElementsByTagName('file');
			try {
			content = results[0].firstChild.nodeValue;
			content = content.replace(/&lt;/gi, "<");
			content = content.replace(/&gt;/gi, ">");
			content = content.replace(/&amp;/gi, "&");
			content = content.replace(/&apos;/gi, "'");
			content = content.replace(/&quot;/gi, "\"");
			}
			catch(e) {
			content = "";
			}
			var file = {
				path: object.path,
				contents: content
			};
	        if(object.callback) { object.callback(file); }
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.write = function(object)
   {
		try {
		object.content = object.content.replace(/</gi, "&lt;");
		object.content = object.content.replace(/>/gi, "&gt;");
		object.content = object.content.replace(/&/gi, "&amp;");
		object.content = object.content.replace(/'/gi, "&apos;");
		object.content = object.content.replace(/"/gi, "&quot;");
		}
		catch(e) {
		object.content = "";
		}
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.writeFile"),
		content: {
			path: object.path,
			content: object.content
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs)
		{
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
	this.move = function(object)
    {
		if(object.newname) {
		newpath_ = object.path.lastIndexOf("/");
		newpath = object.path.substring(0, newpath_);
		newpath = newpath + "/" + object.newname;
		}
		else {
		newpath = object.newpath;
		}
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.renameFile"),
		content: {
			path: object.path,
			newpath: newpath
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs)
		{
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
	this.rename = function(object)
	{
		api.console("renaming a file is the same as moving it, technically. - try not to use api.fs.rename.");
		this.move(object);
	}
    this.mkdir = function(object)
    {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.createDirectory"),
		content: {
			path: object.path
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs)
		{
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rm = function(object)
    {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.removeFile"),
		content: {
			path: object.path
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs) {
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rmdir = function(object)
    {
        dojo.xhrPost({
	        url: desktop.core.backend("api.fs.io.removeDir"),
			content: {
				path: object.path
			},
			dsktp_callback: object.callback,
			load: function(data, ioArgs) {
				ioArgs.args.dsktp_callback(data);
			},
	        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
	        mimetype: "text/html"
        });
    }
	this.launchApp = function(path, dir)
	{
		if (dir) {
			desktop.app.launch(desktop.config.filesystem.handlers.folder, {path: path})
		}
		else {
			var l = path.lastIndexOf(".");
			var ext = path.substring(l + 1, path.length);
			if (ext == "desktop") {
				this.read({
					path: path,
					callback: dojo.hitch(this, function(file){
						var c = file.contents.split("\n");
						desktop.app.launch(c[0], dojo.fromJson(c[1]));
					})
				});
			}
			else 
				if (typeof desktop.config.filesystem.handlers[ext] == "number") {
					desktop.app.launch(desktop.config.filesystem.handlers[ext], {
						file: path
					});
				}
				else {
					api.ui.alertDialog({
						title: "Error",
						message: "Cannot open " + path + ", no app associated with that extention"
					});
				}
		}
	}
	this.download = function(path) {
		var url = desktop.core.backend("api.fs.io.download") + "&path=" + path;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	this.display = function(path) {
		return desktop.core.backend("api.fs.io.display") + "&path=" + path;
	}
}