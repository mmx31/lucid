/************************\
|     Psych  Desktop     |
|  App function library  |
| (c) 2006 Psych Designs |
\************************/
var apps = new Array();
var app_code;
var app_lib;
var xml_seperator = "[==separator==]";
var app_xmlHttp;
var app_instance;
function app_launch(id)
{
if(id == -1)
{
api.toaster("Error: could not get app list from server");
}
else
{
exec_app(id);
}
}

function exec_app(id)
{
ui_loadingIndicator(0);
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
    app_instance++;
    app_id = rawcode[0];
    app = function() {
        this.id = app_id;
        this.instance=app_instance;
        this.code = app_code;
        this.init = function()        {            eval(this.code);
        }
        eval(app_lib);
        this.hitch = function(func)
        {
            eval("return dojo.lang.hitch(this, this."+func+");");
        }
    }
    apps[app_id] = new app();
    apps[app_id].init();
    ui_loadingIndicator(1);
}