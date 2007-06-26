api.tray = new function()
{
	this.idcount = 1;
	this.create = function(options)
	{
		if(options.icon)
		{
			tray = document.createElement("td");
			tray.id="trayicon"+this.idcount;
			tray.innerHTML = "<img src='"+options.icon+"' />"
			dojo.byId("tasklist").appendChild(tray);
			this.idcount++;
			return new function()
			{
				this.id=tray.id;
				this.destroy = function()
				{
					dojo.byId("tasklist").removeChild(dojo.byId(this.id));
				}
			};
		}
		else
		{
			api.console("no tray icon given.");
			return false;
		}
	}
}