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
	var url = "../backend/api.php?fs=getFolder&path="+path;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.fs.lsProcess(type, data, http, callback); },
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.read = function(path, callback)
    {
	var url = "../backend/api.php?fs=getFile&path="+path;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.fs.readProcess(type, data, http, callback); },
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.write = function(path, content)
   {
   	var url = "../backend/api.php?fs=writeFile&path="+path+"&content="+content;
        dojo.io.bind({
        url: url,
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.mkdir = function(path)
    {
	var url = "../backend/api.php?fs=createDirectory&path="+path;
        dojo.io.bind({
        url: url,
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.rm = function(path)
    {
	var url = "../backend/api.php?fs=removeFile&path="+path;
        dojo.io.bind({
        url: url,
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
   this.rmdir = function(path)
    {
	var url = "../backend/api.php?fs=removeDir&path="+path;
        dojo.io.bind({
        url: url,
        error: function(type, error) { alert("Error in Crosstalk call: "+error.message); },
        mimetype: "text/xml"
        });
    }
    this.lsProcess = function(type, data, evt, callback)
    {
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
	
    }
    this.readProcess = function(type, data, evt, callback)
    {
		var results = data.getElementsByTagName('file');
		api.fs.fileArray = new Array(99,99);
		api.fs.fileArray[0] = new Object();
		api.fs.fileArray[0].contents = results[0].firstChild.nodeValue;
        if(callback) { callback(api.fs.fileArray); }
        desktop.core.loadingIndicator(1);
	}
}