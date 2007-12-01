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
			var results = data.getElementsByTagName('file');
			api.fs.fileArray = new Array(99,99);
			api.fs.fileArray[0] = new Object();
			api.fs.fileArray[0].path = path;
			api.fs.fileArray[0].contents = results[0].firstChild.nodeValue;
	        if(object.callback) { object.callback(api.fs.fileArray); }
	        desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.write = function(object)
   {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.writeFile"),
		content: {
			path: object.path,
			content: object.content
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.mkdir = function(object)
    {
        dojo.xhrPost({
        url: desktop.core.backend("api.fs.io.createDirectory"),
		content: {
			path: object.path
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
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
}