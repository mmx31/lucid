/** 
* An API that allows storage in a table format.
* TODO: tie this in more with the dojo.data stuff
* 
* @classDescription An API that allows storage in a table format.
* @alias api.db
* @memberOf api
*/
api.database = new function()
{
	/** 
	* Parases the result from a table.
	* 
	* @alias api.db.parseTable
	* @param {String} rawfields	The fields
	* @param {String} cols	The cols.
	* @memberOf api.db
	* @deprecated we should use JSON instead.
	*/
    this.parseTable = function(rawfields, cols)
    {
      var count=0;
      rawfields=rawfields.split("|||");
      for(field in rawfields)
      {
        table[count][table[count].length-1] = field;
        //this next part will make it so something like table[0]['description'] will be valid
        if(table[count].length =cols.length)
        {
          count++;
        }
        for(col in cols)
        {
          rowcount=0;
          for(row in table)
          {
            for(field in row)
            {
              table[rowcount][col] = field
            }
            rowcount++;
          }
        }
      }
      return table;
    }
	/** 
	* Gets a table from the database.
	* TODO: switch over to JSON
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
				data = data.parseJSON();
				callback(data);
			}),
            mimetype:'text/html'
        });
    }
	/** 
	* Saves a table to the database.
	* TODO: switch over to JSON
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
                data: options.table.toJSONString(),
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