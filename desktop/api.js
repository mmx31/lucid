/****************************\
|        Psych Desktop       |
|         API Library        |
|   (c) 2006 Psych Designs   |
\***************************/

function createvar(name)
{
eval("var "+name+";");
}

// Registry API Start

function registry() {
var value;
var varname;
var appid;
var userid;
var ID;
}
registry = new registry();

function getRegistryValue(appid,varname)  {
ui_loadingIndicator(0);
app_createRequest();
registry.appid = appid;
registry.varname = varname;
var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
app_xmlHttp.open("GET", url, true);
app_xmlHttp.onreadystatechange = processRegistryGet;
app_xmlHttp.send(null);
}
function processRegistryGet() {
if(app_xmlHttp.readyState == 4){
value = app_xmlHttp.responseText;
registry.value = value;
}
}

/*
 * To-Do: Fix requirment to run twice
 * And and save registry :)
  */
  // end of registry api
