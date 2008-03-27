dojo.provide("api.fs");
dojo.require("dojo.io.iframe");
/*
 * Class: api.fs
 *
 * A server-side virtual filesystem
 *
 * TODO:
 * 		this code should be refactored a little bit. Other then that it's fine.
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
		handleAs: "json",
        load: function(data, ioArgs) {
			var lsArray = [];
			dojo.forEach(data, function(f) {
				lsArray.push({
					isDir: f.type == "folder",
					file: f.name
				});
			})
	        if(object.callback) { object.callback(lsArray); }
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
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
		handleAs: "json",
        load: function(data, ioArgs) {
			var file = {
				path: object.path,
				contents: data.contents
			};
	        if(object.callback) { object.callback(file); }
		},
        error: function(error, ioArgs) { api.log("Error in fs call: "+error.message); }
        });
    }
   /*
    * Method: write
    *
    * Writes data to a file
    *
    * TODO:
    *		add modes such as append only, replace the whole file, etc.
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
		api.xhr({
        backend: "api.fs.io.writeFile",
		content: {
			path: object.path,
			content: object.content
		},
		load: function(data, ioArgs)
		{
			object.callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
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
			object.callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    }
    /*
     * Method: rename
     * 
     * depreciated
     *
     * See:
     * 		<move>
     */
    this.rename = function(/*Object*/object)
    {
		api.log("renaming a file is the same as moving it, technically. - try not to use api.fs.rename.");
		this.move(object);
    }
    /*
     * Method: mkdir
     *
     * Creates a directory
     *
     * Arguments:
     * 		object - a object with additional parameters
     * 		> {
     * 		> 	path: string, //the path to the folder to create
     * 		> 	callback: function //an optional callback once the process has completed
     * 		> 			   //first param is true if successful, false if it failed
     * 		> }
     */
    this.mkdir = function(/*Object*/object)
    {
        api.xhr({
        backend: "api.fs.io.createDirectory",
		content: {
			path: object.path
		},
		load: function(data, ioArgs)
		{
			object.callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    }
   /*
    * Method: rm
    *
    * removes a file
    *
    * Arguments:
    * 		object - an object with additional parameters
    * 		> {
    * 		> 	path: string, //the path to the file to be removed
    * 		> 	callback: function //a callback function once the operation is completed
    * 		> 			   //first param is true if successful, false if failed
    * 		> }
    */
   this.rm = function(/*Object*/object)
    {
        api.xhr({
        backend: "api.fs.io.removeFile",
		content: {
			path: object.path
		},
		load: function(data, ioArgs) {
			object.callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    }
	/*
	 * Method: copy
	 * 
	 * Copies a file
	 * 
	 * Arguments:
	 * 		object - an object containing additional parameters
	 * 		> {
	 * 		> 	to: string, //the path of the new copy of the file
	 * 		> 	from: string, //the path to the original file
	 * 		> 	callback: function //a callback function. First param is true if successful, false if it failed.
	 * 		> }
	 */
   this.copy = function(/*Object*/object)
    {
        api.xhr({
        backend: "api.fs.io.copyFile",
		content: {
			path: object.from,
			newpath: object.to
		},
		load: function(data, ioArgs) {
			object.callback(data);
		},
        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    }
   /*
    * Method: rmdir
    *
    * removes a directory recursivly
    *
    * Arguments:
    * 		object - an object with additional parameters
    * 		> {
    * 		> 	path: string, //the path to the directory to be removed
    * 		> 	callback: function //a callback function once the operation is completed
    * 		> 			   //first param is true if successful, false if failed
    * 		> }
    */
   this.rmdir = function(/*Object*/object)
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
	        error: function(error, ioArgs) { api.log("Error in filesystem call: "+error.message); }
        });
    }
	/*
	 * Method: download
	 * 
	 * Points the browser to the file and forces the browser to download it.
	 * 
	 * Arguments:
	 * 		path - the path to the file that needs to be downloaded
	 */
	this.download = function(/*String*/path) {
		var url = api.xhr("api.fs.io.download") + "&path=" + path;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	/*
	 * Method: downloadFolder
	 * 
	 * Compresses a folder into an archive and forces the browser to download it.
	 * 
	 * Arguments:
	 * 		path - the path to the folder to be compressed and downloaded
	 * 		as - the archive format. Defaults to a zip archive. Can be "zip", "gzip", or "bzip"
	 */
	this.downloadFolder = function(/*String*/path, /*String*/as) {
		if(as == null) { as = "zip" }
		var url = api.xhr("api.fs.io.downloadFolder") + "&path=" + path + "&as=" + as;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	/*
	 * Method: compressDownload
	 * 
	 * Takes the same arguments as <downloadFolder>, but the 'path' argument takes a file instead of a folder.
	 * 
	 * See:
	 * 		<downloadFolder>
	 */
	this.compressDownload = function(/*String*/path, /*String*/as) {
		if(as == null) { as = "zip" }
		var url = api.xhr("api.fs.io.compressDownload") + "&path=" + path + "&as=" + as;
		var frame = dojo.io.iframe.create("fs_downloadframe", "");
		dojo.io.iframe.setSrc(frame, url, true);
	}
	/*
	 * Method: embed
	 * 
	 * Generates a URL that you can use in an img tag or an embed tag.
	 * 
	 * Arguments:
	 * 		path - the path to the file on the filesystem
	 * 
	 * Returns:
	 * 		a string containing a url
	 */
	this.embed = function(/*String*/path) {
		return api.xhr("api.fs.io.display") + "&path=" + path;
	}
	/*
	 * Method: info
	 * 
	 * fetches information about a file
	 * 
	 * Arguments:
	 * 		path - the path to the file
	 * 		callback - a callback function. First argument is an object with the file's information:
	 * 		> {
	 * 		> 	file: bool, //will be true if the path is a file
	 * 		> 	dir: bool, //will be true if the path is a directory
	 * 		> 	size: int, //the size of the file. Not given for directories.
	 * 		> 	last_modified: string, //a timestamp of when the file was last modified (F d Y H:i:s.). Not provided for directories.
	 * 		> 	mimetype: string //the mimetype of the file. will be "text/directory" for directories.
	 * 		> }
	 */
	this.info = function(/*String*/path, /*Function*/callback) {
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
