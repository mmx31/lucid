api.database = new function()
{
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
	this.callbacks = new Object();
    this.getTable = function(appid, name, callback)
    {
		this.callbacks[appid+name] = callback;
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
    this.saveTable = function(appid, pub, name, columns, table)
    {
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

        //umm not sure if it's rawtable.length-3 or rawtable.length-2... might result in a bug...
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