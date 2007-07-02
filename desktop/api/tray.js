/** 
* An API that interacts with the system tray
* TODO: make this more like the window API
* 
* @classDescription An API that interacts with the system tray
* @memberOf api
*/
api.tray = new function()
{
	/**
	 * A unique ID counter for the tray icon
	 * 
	 * @type {Integer}
	 * @alias api.tray.idcount
	 * @memberOf api.tray
	 */
	this.idcount = 1;
	/**
	 * An icon maker
	 * 
	 * @param {Object} options	The icon's options
	 * @alias api.tray.icon
	 * @memberOf api.tray
	 */
	this.icon = function(options)
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