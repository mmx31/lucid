dojo.require("dojo.io.iframe");
/*
 * Class: api.fs
 *
 * A server-side virtual filesystem
 *
 * TODO: this code should be refactored a little bit. Other then that it's fine.
 */
api.fs = new function()
{ 
   /*
    * Method: ls
    *
    * Lists the files/folders of a given path
    *
    * Arguments:
    * 		object - an object containing a few extra parameters:
    * 		> {
    * 		> 	path: string, //the path to list
    * 		> 	callback: function(array) //a callback function
    * 		> }
    *		The callback will recive an array as it's first argument.
    *		In this array are objects with the file information:
    *		> {
    *		> 	isDir: bool, //is this file a directory?
    *		> 	file: string //the file's name
    *		> }
    */
   this.ls = function(/*Object*/object)
    {
        api.xhr({
        backend: "api.fs.io.getFolder",
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
		},
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   /*
    * Method: read
    *
    * Reads a file's contents
    *
    * Arguments:
    * 		object - an object taking the following parameters:
    * 		> {
    * 		> 	path: string, //the path to the file
    * 		> 	callback: function //a callback function
    * 		> }
    * 		The callback function gets an object as it's first argument with these values:
    * 		> {
    * 		> 	path: string, //the path to the file
    * 		> 	contents: string //the contents of the file
    * 		> }
    */
   this.read = function(/*Object*/object)
    {
        api.xhr({
        backend: "api.fs.io.getFile",
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
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   /*
    * Method: write
    *
    * Writes data to a file
    *
    * TODO: add modes such as append only, replace the whole file, etc.
    *
    * Arguments:
    * 		object - an object containing some parameters
    * 		> {
    * 		> 	content: string, //a string with the data to write to the server
    * 		> 	path: string, //the path to the file
    * 		> 	callback: function //a callback once the saving is complete.
    * 		> 			   //First argument is true if successful, false if it failed
    * 		> }
    */
   this.write = function(/*Object*/object)
   {
		/*try {
		object.content = object.content.replace(/</gi, "&lt;");
		object.content = object.content.replace(/>/gi, "&gt;");
		object.content = object.content.replace(/&/gi, "&amp;");
		object.content = object.content.replace(/'/gi, "&apos;");
		object.content = object.content.replace(/"/gi, "&quot;");
		}
		catch(e) {
		object.content = "";
		}*/
        api.xhr({
        backend: "api.fs.io.writeFile",
		content: {
			path: object.path,
			content: object.content
		},
		load: function(data, ioArgs)
		{
			callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); },
        mimetype: "text/html"
        });
    }
    /*
     * Method: move
     *
     * Moves or renames a file
     *
     * Arguments:
     * 		object - an object with additional parameters
     * 		> {
     * 		> 	newpath: string, //the path to move it to (optional)
     * 		> 	newname: string, //the new filename (optional)
     * 		> 	path: string, //the file to rename/move
     * 		> 	callback: function //a callback that gets called when the operation is complete.
     * 		> 			   //the first argument is true when successful, false when it failed.
     * 		> }
     *		if newname is provided, the file does not move to a different directory
     *		if newpath is provided, the file will be moved to that path
     *		if newname is provided, the newpath argument is ignored.
     */
    this.move = function(/*Object*/object)
    {
	if(object.newname) {
		var newpath_ = object.path.lastIndexOf("/");
		var newpath = object.path.substring(0, newpath_);
		newpath = newpath + "/" + object.newname;
	} else {
		var newpath = object.newpath;
	}
        api.xhr({
        backend: "api.fs.io.renameFile",
		content: {
			path: object.path,
			newpath: newpath
		},
		load: function(data, ioArgs)
		{
			callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
    /*
     * Method: rename
     *
     * See: <api.fs.move>
     */
    this.rename = function(object)
    {
		api.log("renaming a file is the same as moving it, technically. - try not to use api.fs.rename.");
		this.move(object);
    }
    this.mkdir = function(object)
    {
        api.xhr({
        backend: "api.fs.io.createDirectory",
		content: {
			path: object.path
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs)
		{
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rm = function(object)
    {
        api.xhr({
        backend: "api.fs.io.removeFile",
		content: {
			path: object.path
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs) {
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.copy = function(object)
    {
        api.xhr({
        backend: "api.fs.io.copyFile",
		content: {
			path: object.from,
			newpath: object.to
		},
		dsktp_callback: object.callback,
		load: function(data, ioArgs) {
			ioArgs.args.dsktp_callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rmdir = function(object)
    {
        api.xhr({
	        backend: "api.fs.io.removeDir",
			content: {
				path: object.path
			},
			dsktp_callback: object.callback,
			load: function(data, ioArgs) {
				ioArgs.args.dsktp_callback(data);
			},
	        error: function(error, ioArgs) { api.log("Error in Crosstalk call: "+error.message); },
	        mimetype: "text/html"
        });
    }
	this.download = function(path) {
		var url = api.xhr("api.fs.io.download") + "&path=" + path;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	this.downloadFolder = function(path, as) {
		if(as == null) { as = "zip" }
		var url = api.xhr("api.fs.io.downloadFolder") + "&path=" + path + "&as=" + as;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	this.compressDownload = function(path, as) {
		if(as == null) { as = "zip" }
		var url = api.xhr("api.fs.io.compressDownload") + "&path=" + path + "&as=" + as;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	this.embed = function(path) {
		return api.xhr("api.fs.io.display") + "&path=" + path;
	}
	this.info = function(path, callback) {
		api.xhr({
			backend: "api.fs.io.info",
			content: {
				path: path
			},
			load: function(data, args) {
				callback(data);
			},
			handleAs: "json"
		})
	}
}
