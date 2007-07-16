/** 
* An API that allows an app to store short strings persistantly.
* 
* @classDescription An API that allows an app to store short strings persistantly.
* @memberOf api
*/
api.registry = new function()
{
	/** 
	* Gets a registry value
	* TODO: move arguments into an object
	* 
	* @alias api.registry.getValue
	* @param {Integer} appid	The current app's ID
	* @param {String} varname	The variable's name
	* @param {Function} callback	A function to pass the value to
	* @memberOf api.registry
	*/
    this.getValue = function(appid,varname,callback)
    {
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
        url: "../backend/api/registry.php?registry=load&appid="+appid+"&varname="+varname,
        load: function(data, ioArgs) {
			if(callback) { callback(data); }
     		desktop.core.loadingIndicator(1);
		},
        error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); },
		mimetype: "text/plain"
        });
    }
	/** 
	* Saves a registry value
	* TODO: move arguments into an object
	* 
	* @alias api.registry.getValue
	* @param {Integer} appid	The current app's ID
	* @param {String} varname	The variable's name
	* @param {String} value	The new value of the variable
	* @memberOf api.registry
	*/
    this.saveValue = function(appid,varname,value)
    {
        desktop.core.loadingIndicator(0);
        dojo.xhrPost({
            url: "../backend/api/registry.php?registry=save&appid="+appid+"&varname="+varname,
            content: {value: value},
			error: function(error, ioArgs) { api.console("Error in AJAX call: "+error.message); },
            mimetype: "text/plain"
        });
        desktop.core.loadingIndicator(1);
    }
	/** 
	* Removes a registry value
	* TODO: move arguments into an object
	* 
	* @alias api.registry.getValue
	* @param {Integer} appid	The current app's ID
	* @param {String} varname	The variable's name
	* @memberOf api.registry
	*/
	this.removeValue = function(appid,varname)
    {
        desktop.core.loadingIndicator(0);
        dojo.xhrGet({
            url: "../backend/api/registry.php?registry=remove&appid="+appid+"&varname="+varname,
            error: function(error, ioArgs) { api.toaster("Error in AJAX call: "+error.message); },
            mimetype: "text/plain"
        });
        desktop.core.loadingIndicator(1);
    }
}