/*
 * Group: api
 * 
 * Package: instances
 * 
 * Summary:
 * 		An API that aids in instance mangement
 */
 
 api.instances = new function()
 {
 	/** 
	* Kill an instance
	* 
	* @alias api.instances.kill
	* @param {Integer} instance	Instance ID to kill
	* @memberOf api.instances
	*/
	this.kill = function(instance) {
		try {
			desktop.app.instances[instance].kill();
			return 1;
		}
		catch(err) {
			return 0;
		}
	}
	 /** 
	* Kill an instance
	* 
	* @alias api.instances.kill
	* @param {Integer} instance	Instance ID to kill
	* @memberOf api.instances
	*/
	this.kill = function(instance) {
		try {
			desktop.app.instances[instance].kill();
			return true;
		}
		catch(err) {
			return false;
		}
	}
	/** 
	* Get the status of an instance
	* 
	* @alias api.instances.getStatus
	* @param {Integer} instance	Instance ID to get status of
	* @memberOf api.instances
	*/
	this.getStatus = function(instance) {
		return desktop.app.instances[instance].status;
	}
	/** 
	* Get instance AppID
	* 
	* @alias api.instances.getAppID
	* @param {Integer} instance	Instance ID to get appid of
	* @memberOf api.instances
	*/
	this.getAppID = function(instance) {
		return desktop.app.instances[instance].id;
	}
	/** 
	* Get instance appname
	* 
	* @alias api.instances.getAppName
	* @param {Integer} instance	Instance ID to get appname of
	* @memberOf api.instances
	*/
	this.getAppName = function(instance) {
		return desktop.app.instances[instance].name;
	}
	/** 
	* Set instance as active
	* 
	* @alias api.instances.setActive
	* @param {Integer} instance	Instance ID to set active
	* @memberOf api.instances
	*/
	this.setActive = function(instance) {
		desktop.app.instances[instance].status = "active";
	}
	/** 
	* Set instance as killed
	* 
	* @alias api.instances.setKilled
	* @param {Integer} instance	Instance ID to set killed
	* @memberOf api.instances
	*/
	this.setKilled = function(instance) {
		desktop.app.instances[instance].status = "killed";
		//allow the garbage collector to free up memory
		desktop.app.instances[instance] = null;
	}
	/** 
	* Get all instances
	* 
	* @alias api.instances.getInstances
	* @memberOf api.instances
	*/
	this.getInstances = function() {
		this.returnObject = new Array();
		this.count = 0;
		for(var x = 1; x<desktop.app.instances.length; x++){
				if (typeof desktop.app.instances[x] != "undefined") {
					this.returnObject[count] = new Object();
					this.returnObject[count].instance = x;
					this.returnObject[count].status = desktop.app.instances[x].status;
					this.returnObject[count].appid = desktop.app.instances[x].id;
					this.returnObject[count].name = desktop.app.instances[x].name;
					this.returnObject[count].version = desktop.app.instances[x].version;
				}
			count++;
		}
		return this.returnObject;
	}
	}
	
	
