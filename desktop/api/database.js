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
    this.getTable = function(appid, name, callback)
    {
        //grab the table, parse it using this.parseTable, and pass the array onto the function.
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
        rawtable.substring(0, rawtable.length-3);
        rawcols = "";
        for(title in columns)
        {
            title.replace(/|||/," ");
            field.replace(/-|-/," ");
            rawcols += title+"|||";
        }
        rawcols.substring(0, rawcols.length-3);

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