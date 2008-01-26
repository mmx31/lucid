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
