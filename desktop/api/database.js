/*
 * Group: api
 * 
 * Package: Database
 * 
 * Summary:
 * 		An API that allows storage in a table format.
 * 
 */
api.database = new function()
{
	//TODO: tie this in more with the dojo.data stuff
	/** 
	* Gets a table from the database.
	* 
	* @alias api.db.getTable
	* @param {Object} options	The options
	* @memberOf api.db
	*/
    this.getTable = function(options)
    {
		appid=options.appid;
		name=options.name;
		callback=options.callback;
		dojo.xhrGet({
            url: "../backend/api.php?action=getDatabase?appid="+appid+"&tablename="+name,
            method: "GET",
			load: dojo.lang.hitch(this, function(data, ioArgs)
			{
				data = dojo.fromJson(data);
				callback(data);
			}),
            mimetype:'text/html'
        });
    }
	/** 
	* Saves a table to the database.
	* 
	* @alias api.db.saveTable
	* @param {Object} options	The options
	* @memberOf api.db
	*/
    this.saveTable = function(options)
    {		
        dojo.xhrGet({
            url: "../backend/api.php?action=saveDatabase",
            method: "post",
            content: {
                data: dojo.toJson(options.table),
				userid: options.userid,
                pub: options.pub,
                name: options.name,
                appid: options.appid
            },
            mimetype:'text/html'
        });            
    }
}
api.db = api.database;