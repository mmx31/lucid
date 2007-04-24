/**********************************\
|           Psych Desktop          |
|            API Library           |
|      (c) 2006 Psych Designs      |
| All functions here can be called |
| 	  via api.functionname();      |
\**********************************/
function api() {
    this.apicount = 0;
    this.createvar = function(name)
    {
        eval("var "+name+";");
    }
    this.count = function()
    {
        api.apicount++;
        return api.apicount;
    }
    // Registry API Start

    this.registry = function() { }
    this.registry = new this.registry();

    this.registry.getValue = function(appid,varname,callback)
    {
        api.registry.callback = callback;
        ui_loadingIndicator(0);
        var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
        eval("dojo.io.bind({url: url, load: function(type, data, http) { api.registry.processRegistryGet(type, data, http, \""+callback+"\"); }, error: sys_toastererr, mimetype: \"text/plain\" });");
    }
    this.registry.saveValue = function(appid,varname,value)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?registry=save&appid="+appid+"&varname="+varname+"&value="+value;
        dojo.io.bind({
            url: url,
            error: sys_toastererr,
            mimetype: "text/plain"
        });
        ui_loadingIndicator(1);
    }
    this.registry.processRegistryGet = function(type, data, evt, callback)
    {
        api.registry.value = data;
        //var callback = api.registry.callback;
        if(callback) { eval(callback+"(\""+data+"\")"); }
        ui_loadingIndicator(1);
    }
    // end of registry api

    //start filesystem api
    this.fs = function() { }
    this.fs = new this.fs();

    this.fs.getFile = function(file,directory,callback)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=load&file="+file+"&directory="+directory;
        eval("dojo.io.bind({url: url, load: function(type, data, http) { api.fs.getFileProcess(type, data, http, \""+callback+"\"); }, error: sys_toastererr, mimetype: \"text/plain\" });");
    }
	this.fs.listFiles = function(callback)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=list";
        eval("dojo.io.bind({url: url, load: function(type, data, http) { api.fs.fileListProcess(type, data, http, \""+callback+"\"); }, error: sys_toastererr, mimetype: \"text/plain\" });");
    }
    this.fs.getFileProcess = function(type, data, evt, callback)
    {
        api.fs.content = data;
        if(callback) { eval(callback+"(\""+data+"\")"); }
        ui_loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
	this.fs.fileListProcess = function(type, data, evt, callback)
    {
        /* to do: 
		add some code to process the list instead of reling on the program to do it 
		  - the files are seperated by the same seperator as the app list 
		  */
        if(callback) { eval(callback+"(\""+data+"\")"); }
        ui_loadingIndicator(1);
        api.toaster("Security Note: FileSystem was accessed.");
    }
    this.fs.listFiles = function(directory)
    {
        ui_loadingIndicator(0);
        var url = "../backend/api.php?fs=load&file="+file+"&directory="+directory;
        dojo.io.bind({
            url: url,
            error: sys_toastererr,
            mimetype: "text/xml",
        });
    }
}
api = new api();

function sys_toastererr(type, error)
{
    api.toaster("Error in AJAX call: "+error.message);
    ui_loadingIndicator(1);
}