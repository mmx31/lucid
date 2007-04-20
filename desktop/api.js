/**********************************\
|           Psych Desktop          |
|            API Library           |
|      (c) 2006 Psych Designs      |
| All functions here can be called |
| 	  via api.functionname();      |
\**********************************/
function api() {
var api_xmlHttp;
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
	method: "get",
    load: api.registry.processRegistryGet,
    error: erroralert,
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
	method: "post",
    error: erroralert,
    mimetype: "text/plain"
});
ui_loadingIndicator(1);
}
this.registry.processRegistryGet = function(type, data, evt) {
value = data;
api.registry.value = value;
ui_loadingIndicator(1);
}
}
api = new api();
api.registry.value = null; //wondering if that maybe will fix it...
/*
 * To-Do: Fix requirment to run twice
 * And and save registry :)
  */
  // end of registry api
