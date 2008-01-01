desktop.console = new function()
{
	/** 
	* Toggles the console
	* 
	* @alias desktop.console.toggle
	* @param {Object} e	parameter that the document.onKey event provides.
	* @memberOf desktop.console
	*/
	this.toggle = function(e)
	{
		if (document.all)
	    {
	    	var evnt = window.event;
	        x = evnt.keyCode;
	    }
	    else
	    {
	    	x = e.keyCode;
	    }
		//alert(x);
		//alert(window.navigator.appName);
		if(window.navigator.appName == "Opera")
		{
			code="96";
		}
		else code="192";
		if(x == code)
		{
			dojo.stopEvent(e);
			dojo.byId("consolepath").innerHTML = desktop.console.path;
			if(dojo.byId("console").style.display == "block")
			{
				dojo.byId("console").style.display = "none";
			}
			else
			{
				dojo.byId("console").style.display = "block";
				setTimeout("dojo.byId('consoleinput').focus();", 400);
			}
		}
	}
}
