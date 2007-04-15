/****************************\
|        Psych Desktop       |
|         API Library        |
|   (c) 2006 Psych Designs   |
|  All functions here can be called |
| 	via api.functionname();    |
\***************************/
function api() {
this.createvar = function(name)
{
eval("var "+name+";");
}

// Registry API Start

this.registry = function() { }
this.registry = new this.registry();

this.registry.getRegistryValue = function(appid,varname)  {
ui_loadingIndicator(0);
app_createRequest();
api.registry.appid = appid;
api.registry.varname = varname;
var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
app_xmlHttp.open("GET", url, true);
app_xmlHttp.onreadystatechange = api.registry.processRegistryGet;
app_xmlHttp.send(null);
}
this.registry.processRegistryGet = function() {
if(app_xmlHttp.readyState == 4){
value = app_xmlHttp.responseText;
api.registry.value = value;
}
}
}
api = new api();

/*
 * To-Do: Fix requirment to run twice
 * And and save registry :)
  */
  // end of registry api
