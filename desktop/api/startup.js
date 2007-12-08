api.startup = new function()
{
	/**
	* Allows the program to register it's self as a startup application
	* 
	* @param {object} contains the appid to add
	* @memberOf api.startup
	* @alias api.startup.addApp
	*/
	this.addApp = function(object)
	{
		phail = false;
		for(a=0; a<desktop.config.startupapps.length; a++) {
			if(desktop.config.startupapps == object.appid) {
				phail = true; //omgz it's already found so don't add it and it's phail
			}
		}
		if(!phail) {
			desktop.config.startupapps.push(object.appid);
			return true;
		}
		return false;
	}
	/**
	* Allows the program to unregister it's self as a startup application
	* 
	* @param {object} contains the appid to add
	* @memberOf api.startup
	* @alias api.startup.delApp
	*/
	this.delApp = function(object)
	{
		phail = true;
		for(a=0; a<desktop.config.startupapps.length; a++) {
			if(desktop.config.startupapps == object.appid) {
				phail = false; //no phail no phail
				desktop.config.startupapps.splice(a,1);
			}
		}
		if(!phail) {
			return true;
		}
		return false;
	}
}
			