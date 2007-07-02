/** 
* An API that allows storage in a table format.
* TODO: tie this in more with the dojo.data stuff
* 
* @classDescription An API that allows storage in a table format.
* @memberOf api
*/
api.db = new function()
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
		dojo.io.bind({
            url: "../backend/api.php?action=getDatabase?appid="+appid+"&tablename="+name,
            method: "GET",
			load: dojo.lang.hitch(this, function(type, data, evt)
			{
				data = data.split("-|-");
				callback(this.parseTable(data[1], data[0]));
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
		appid=options.appid;
		pub=options.pub;
		name=options.name;
		columns=options.columns;
		table=options.table;
		
		rawtable = "";
        for(field in table)
        {
            field.replace(/|||/," ");
            field.replace(/-|-/," ");
            rawtable += field+"|||";
        }
        rawtable=rawtable.substring(0, rawtable.length-3);
        rawcols = "";
        for(title in columns)
        {
            title.replace(/|||/," ");
            title.replace(/-|-/," ");
            rawcols += title+"|||";
        }
        rawcols=rawcols.substring(0, rawcols.length-3);

        dojo.io.bind({
            url: "../backend/api.php?action=saveDatabase",
            method: "post",
            content: {
                columns: rawcols,
                table: rawtable,
                pub: pub,
                name: name,
                appid: appid
            },
            mimetype:'text/html'
        });            
    }
}