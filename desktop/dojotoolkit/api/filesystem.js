dojo.provide("api.filesystem");
dojo.require("dojo.io.iframe");
api.filesystem = { 
	//	summary:
	//		A server-side virtual filesystem
	/*=====
	_fileInfo: {
		//	name: String
		//		the name of the file
		name: "",
		//	type: String
		//		the mimetype of the file ("text/directory" for directories)
		type: "text/plain",
		//	size: Int
		//		the size of the file (in bytes)
		size: 0,
		//	modified: String
		//		a timestamp of when the file was last modified
		modified: "F d Y H:i:s."
	},
	=====*/
	listDirectory: function(/*String*/path, /*Function*/callback)
    {
		//	summary:
		//		Lists the files/folders of a given path
		//	path:
		//		the path to list
		//	callback:
		//		a callback function. The first argument passed is an array of api.filesystem._fileInfo objects
        return api.xhr({
	        backend: "api.fs.io.getFolder",
			content: {
				path: path
			},
			handleAs: "json",
	        load: function(data, ioArgs) {
		        if(callback) callback(data);
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); },
			handleAs: "json"
        });
    },
	readFileContents: function(/*String*/path, /*Function*/callback)
    {
		//	summary:
		//		Reads a file's contents
		//	path:
		//		the path to the file to be read
		//	callback:
		//		a callback function. The first argument is the contents of the file
        return api.xhr({
	        backend: "api.fs.io.getFile",
			content: {
				path: path
			},
			handleAs: "json",
	        load: function(data, ioArgs) {
				if(callback) callback(data.contents);
			},
	        error: function(error, ioArgs) { api.log("Error in fs call: "+error.message); }
        });
    },
   writeFileContents: function(/*String*/path, /*String*/content, /*Function?*/callback)
   {
   		//	summary:
		//		Writes data to a file
		//	path:
		//		the path to the file
		//	content:
		//		the content to write to the file
		//	callback:
		//		a callback once the saving is complete. First argument is true if successful, false if it failed.
		return api.xhr({
	        backend: "api.fs.io.writeFile",
			content: {
				path: path,
				content: content
			},
			load: function(data, ioArgs)
			{
				if(callback) callback(data=="0");
				var p = path.lastIndexOf("/");
				dojo.publish("filearea:"+path.substring(0, p+1), []);
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    },
    move: function(/*String*/from, /*String*/to, /*Function?*/callback)
    {
		//	summary:
		//		moves or renames a file
		//	from:
		//		the source file
		//	to:
		//		the new filename or path. If only a filename is specified, the file will stay in it's source's directory
		if(to.indexOf("/") == -1) {
			var i = from.lastIndexOf("/");
			var newpath = from.substring(0, i);
			newpath += "/" + to;
		} else {
			var newpath = to;
		}
        return api.xhr({
	        backend: "api.fs.io.renameFile",
			content: {
				path: from,
				newpath: newpath
			},
			load: function(data, ioArgs)
			{
				if(callback) callback(data);
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    },
    createDirectory: function(/*String*/path, /*Function?*/callback)
    {
		//	summary:
		//		Creates a directory
		//	path:
		//		the path of the new directory to create
		//	callback:
		//		A callback function once the operation is completed. First param is true if successful, false if it failed.
        return api.xhr({
	        backend: "api.fs.io.createDirectory",
			content: {
				path: path
			},
			load: function(data, ioArgs)
			{
				if(callback) callback(data=="0");
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    },
	remove: function(/*String*/path, /*Function?*/callback)
    {
		//	summary:
		//		removes a file or directory
		//	path:
		//		the path to the file or directory
		//	callback:
		//		a callback function. First param is true if successful, false if failed
        return api.xhr({
	        backend: "api.fs.io.removeFile",
			content: {
				path: path
			},
			load: function(data, ioArgs) {
				if(callback) callback(data=="0");
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    },
	copy: function(/*String*/from, /*String*/to, /*Function?*/callback)
    {
		//	summary:
		//		Copies a file
		//	from:
		//		the path to the original file
		//	to:
		//		the path to the new copy of the file
		//	callback:
		//		a callback function once the task is done. First param is true if successful, false if it failed.
        return api.xhr({
	        backend: "api.fs.io.copyFile",
			content: {
				path: from,
				newpath: to
			},
			load: function(data, ioArgs) {
				if(callback) callback(data=="0");
			},
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    },
	download: function(/*String*/path, /*String?*/as) {
		//	summary:
		//		Points the browser to the file and forces the browser to download it.
		//	path:
		//		the path to the file or folder that needs to be downloaded
		//	as:
		//		Specify this argument to compress the file/folder in an archive
		//		Possible values are "zip", "gzip", or "bzip"
		//		When this argument is not provided, it downloads the uncompressed file.
		//		If downloading a directory, this argument defaults to "zip".
		var url = api.xhr("api.fs.io.download") + "&path=" + escapeURIComponent(path) + (as ? "&as=" + escapeURIComponent(as) : "");
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	},
	embed: function(/*String*/path) {
		//	summary:
		//		Generates a URL that you can use in an img tag or an embed tag.
		//	path:
		//		the path to the file on the filesystem
		//	returns:
		//		a string containing a url
		return api.xhr("api.fs.io.display") + "&path=" + path;
	},
	info: function(/*String*/path, /*Function*/callback) {
		//	summary:
		//		fetches information about a file
		//	path:
		//		the path to the file
		//	callback:
		//		a callback function. First argument is an api.filesystem._fileInfo object
		return api.xhr({
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
