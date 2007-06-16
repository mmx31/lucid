api.registry = new function()
{
    this.getValue = function(appid,varname,callback)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?registry=load&appid="+appid+"&varname="+varname;
        dojo.io.bind({
        url: url,
        load: function(type, data, http) { api.registry.processRegistryGet(type, data, http, callback); },
        error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
    }
    this.saveValue = function(appid,varname,value)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?registry=save&appid="+appid+"&varname="+varname+"&value="+value;
        dojo.io.bind({
            url: url,
            error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
            mimetype: "text/plain"
        });
        desktop.core.loadingIndicator(1);
    }
	this.removeValue = function(appid,varname)
    {
        desktop.core.loadingIndicator(0);
        var url = "../backend/api.php?registry=remove&appid="+appid+"&varname="+varname;
        dojo.io.bind({
            url: url,
            error: function(type, error) { api.toaster("Error in AJAX call: "+error.message); },
            mimetype: "text/plain"
        });
        desktop.core.loadingIndicator(1);
    }
    this.processRegistryGet = function(type, data, evt, callback)
    {
        api.registry.value = data;
        if(callback) { callback(data); }
        desktop.core.loadingIndicator(1);
    }
}