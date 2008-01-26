desktop.reload = false;
desktop.isLoaded = false;
/*
 * Package: core
 * 
 * Group: desktop
 * 
 * Summary:
 * 		Contains all the core functions of the desktop
 */
desktop.core = new function()
{
		/** 
		* Instalizes the desktop
		* 
		* @alias desktop.core.init
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.init = function()
		{
			this.beforeUnloadEvent = dojo.connect(window, "onbeforeunload", null, function(e)
			{
				desktop.core.logout(true);
			});
		}
		/** 
		* Logs the user out
		* TODO: get this working
		* 
		* @alias desktop.core.logout
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.logout = function(sync)
		{
			if(desktop.reload) { return false; }
			dojo.disconnect(this.beforeUnloadEvent);
			if(typeof sync == "undefined") sync=false;
			desktop.config.save(sync);
			dojo.publish("desktoplogout", ["yes"]);
			dojo.xhrGet({
				url: desktop.core.backend("core.user.auth.logout"),
				sync: sync,
				load: function(data, ioArgs){
					if(data == "0")
					{
						if(desktop.config.fx == true)
						{
							var anim = dojo.fadeOut({node: document.body, duration: 1000});
							dojo.connect(anim, "onEnd", null, function(){
								dojo.style(document.body, "opacity", 0);
								window.close();
							});
							anim.play();
						}
						else
						{
							dojo.style(document.body, "opacity", 0);
							window.close();
						}
					}
					else
					{
						api.log("Error communicating with server, could not log out");
					}
				},
					mimetype: "text/plain"
			});
		}
		/** 
		* Shows or hides the loading indicator
		* 
		* @alias desktop.core.loadingIndicator
		* @param {Integer} action	When set to 0 the loading indicator is displayed. When set to 1, the loading indicator will be hidden.
		* @type {Function}
		* @memberOf desktop.core
		*/
		this.loadingIndicator = function(action)
		{
			//api.log("desktop.core.loadingIndicator is depricated!");
		}
		/*
		 * This generates a backend to use based on the module given
		 */
		this.backend = function(module)
		{
			var mod=module.split(".");
			//TODO: put in something so we can switch to python backends when desired
			var url = "../backend";
			for(var i=0; i <= mod.length-3; i++)
			{
				url += "/"+mod[i];
			}
			url += ".php?section="+escape(mod[mod.length-2]);
			url += "&action="+escape(mod[mod.length-1])
			return url;
		}
}
