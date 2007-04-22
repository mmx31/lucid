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

this.registry.getValue = function(appid,varname,callback)  {
/*
ui_loadingIndicator(0);
//app_createRequest();
api.registry.appid = appid;
api.registry.varname = varname;
var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
app_xmlHttp.open("GET", url, true);
app_xmlHttp.onreadystatechange = api.registry.processRegistryGet;
app_xmlHttp.send(null);
*/
api.registry.callback = callback;
ui_loadingIndicator(0);
var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
eval("dojo.io.bind({url: url, load: function(type, data, http) { api.registry.processRegistryGet(type, data, http, \""+callback+"\"); }, error: sys_toastererr, mimetype: \"text/plain\" });");}
this.registry.saveValue = function(appid,varname,value)  {
/*
ui_loadingIndicator(0);
//app_createRequest();
api.registry.appid = appid;
api.registry.varname = varname;
api.registry.value = value;
var url = "../backend/api.php?registry=save&appid="+appid+"&varname="+varname+"&value="+value;
app_xmlHttp.open("POST", url, true);
app_xmlHttp.send(null);
*/
ui_loadingIndicator(0);
var url = "../backend/api.php?registry=save&appid="+appid+"&varname="+varname+"&value="+value;
dojo.io.bind({
    url: url,
    error: sys_toastererr,
    mimetype: "text/plain"
});
ui_loadingIndicator(1);
}
this.registry.processRegistryGet = function(type, data, evt, callback) {
api.registry.value = data;
//var callback = api.registry.callback;
if(callback) { eval(callback+"(\""+data+"\")"); }
ui_loadingIndicator(1);
}
// end of registry api

//start filesystem api
this.fs = function() { }
this.fs = new this.fs();
this.fs.getFile = function(file,directory) {
ui_loadingIndicator(0);
var url = "../backend/api.php?fs=load&file="+file+"&directory="+directory;
dojo.io.bind({
    url: url,
    error: sys_toastererr,
    mimetype: "text/plain",
	load: api.fs.getFileProcess
});
}
this.fs.getFileProcess = function(type, data, evt) {
api.fs.content = data;
ui_loadingIndicator(1);
api.toaster("Security Note: FileSystem was accessed.");
}
this.fs.listFiles = function(directory) {
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

