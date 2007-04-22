/************************\
|     Psych  Desktop     |
|  App function library  |
| (c) 2006 Psych Designs |
\************************/


var app_launchTracker= new Array(255);
var app_code;
var app_lib;
var app_liborcode;
var xml_seperator = "[==separator==]";
var app_xmlHttp;

function app_launch(id)
{
if(id == -1)
{
alert("Error: could not get app list from server");
}
else
{
if(!app_launchTracker[id])
{
exec_app(id, "both");
app_launchTracker[id] = 1;
}
else
{
if(app_launchTracker[id] == 1)
{
exec_app(id, "code");
}
}
}
}

function exec_app(id, libCodeProxy)
{
ui_loadingIndicator(0);
app_liborcode = libCodeProxy;
var url = "../backend/app.php?id="+id;
dojo.io.bind({
    url: url,
    load: app_StateChange,
    error: erroralert,
    mimetype: "text/plain"
});
}

function erroralert(type, error) { api.toaster("Error: "+error.message); ui_loadingIndicator(1); }

function app_StateChange(type, data, evt){
app_return = data;
rawcode = app_return.split(xml_seperator);
app_lib = rawcode[5];
app_code = rawcode[4];
if(app_liborcode == "lib")
{
eval(app_lib);
}
else if(app_liborcode == "code")
{
eval(app_code);
}
else if(app_liborcode == "both")
{
eval(app_lib);
eval(app_code);
}
ui_loadingIndicator(1);
}