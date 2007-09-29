/** 
* An API that interacts with the filesystem
* TODO: document this. Also condense it so all the callbacks are not seperate functions.
* 
* @classDescription An API that interacts with the filesystem
* @memberOf api
*/
api.fs = new function()
{ 
   this.ls = function(path, callback)
    {
        dojo.xhrGet({
        url: "../backend/api.php?fs=getFolder&path="+path,
        load: function(data, ioArgs) {
			var results = data.getElementsByTagName('file');
			if(api.fs.lsArray) {
			delete api.fs.lsArray;
			api.fs.lsArray = new Array(99,99);
			}
			else {
			api.fs.lsArray = new Array(99,99);
			}
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
	        if(callback) { callback(api.fs.lsArray); }
        	desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.read = function(path, callback)
    {
        dojo.xhrGet({
        url: "../backend/api/fs.php?fs=getFile&path="+path,
        load: function(data, ioArgs) {
			var results = data.getElementsByTagName('file');
			api.fs.fileArray = new Array(99,99);
			api.fs.fileArray[0] = new Object();
			api.fs.fileArray[0].path = path;
			api.fs.fileArray[0].contents = results[0].firstChild.nodeValue;
	        if(callback) { callback(api.fs.fileArray); }
	        desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.write = function(path, content)
   {
        dojo.xhrGet({
        url: "../backend/api/fs.php?fs=writeFile&path="+path+"&content="+content,
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.mkdir = function(path)
    {
        dojo.xhrGet({
        url: "../backend/api/fs.php?fs=createDirectory&path="+path,
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rm = function(path)
    {
        dojo.xhrGet({
        url: url = "../backend/api/fs.php?fs=removeFile&path="+path,
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
   this.rmdir = function(path)
    {
        dojo.xhrGet({
        url: "../backend/api/fs.php?fs=removeDir&path="+path,
        error: function(error, ioArgs) { api.console("Error in Crosstalk call: "+error.message); },
        mimetype: "text/html"
        });
    }
}