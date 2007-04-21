/**********************************\
|           Psych Desktop          |
|            API Library           |
|      (c) 2006 Psych Designs      |
| All functions here can be called |
| 	  via api.functionname();      |
\**********************************/
function api() {
this.createvar = function(name)
{
eval("var "+name+";");
}

// Registry API Start

this.registry = function() { }
this.registry = new this.registry();

this.registry.getValue = function(appid,varname)  {
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
ui_loadingIndicator(0);
var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
dojo.io.bind({
    url: url,
    load: api.registry.processRegistryGet,
    error: sys_toastererr,
    mimetype: "text/plain"
});
}
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
this.registry.processRegistryGet = function(type, data, evt) {
api.registry.value = data;
ui_loadingIndicator(1);
}
}

api = new api();

function sys_toastererr(type, error)
{
    api.toaster("Error in AJAX call: "+error);
}
/*
 * To-Do: Fix requirment to run twice
 * And and save registry :)
  */
  // end of registry api
