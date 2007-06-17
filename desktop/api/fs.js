api.fs = new function()
{	
    this.saveFile = function(path,contents)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?fs=save&path="+path;
        dojo.io.bind({
		url: url,
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
		mimetype: "text/xml"
        });
    }
	
    this.getFile = function(path,callback)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?fs=load&path="+path;
        dojo.io.bind({url: url,
        load: function(type, data, http) { api.fs.getFileProcess(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); }, mimetype: "text/xml"
        });
    }
	this.listFiles = function(callback)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?fs=list";
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.fs.fileListProcess(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
        mimetype: "text/xml"
        });
    }
    this.getFileProcess = function(type, data, evt, callback)
    {
        var results = data.getElementsByTagName('contents');
		if(api.fs.getFileResult) {
		delete api.fs.getFileResult;
		api.fs.getFileResult = new Object();
		}
		else {
		api.fs.getFileResult = new Object();
		}
		api.fs.getFileResult.contents = results[0].firstChild.nodeValue;
		api.fs.getFileResult.path = results[0].getAttribute("path");
        	api.fs.getFileResult.owner = results[0].getAttribute("owner");
		api.fs.getFileResult.sharing = results[0].getAttribute("sharing");
		if(callback) { callback(api.fs.getFileResult) }
        desktop.core.loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
	this.fileListProcess = function(type, data, evt, callback)
    {
		var results = data.getElementsByTagName('file');
		if(api.fs.listFilesResult) {
		delete api.fs.listFilesResult;
		api.fs.listFilesResult = new Array(99,99);
		}
		else {
		api.fs.listFilesResult = new Array(99,99);
		}
		for(var i = 0; i<results.length; i++){
		api.fs.listFilesResult["count"] = i;
		api.fs.listFilesResult[i] = new Object();
		api.fs.listFilesResult[i].path = results[i].firstChild.nodeValue;
		api.fs.listFilesResult[i].owner = results[i].getAttribute("owner");
		api.fs.listFilesResult[i].isDir = results[i].getAttribute("isDir");
		api.fs.listFilesResult[i].sharing = results[i].getAttribute("sharing");
		}
        if(callback) { callback(api.fs.listFilesResult) }
        desktop.core.loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
}
