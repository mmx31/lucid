api.xhr = function(/*dojo.__ioArgs*/args) {
	if(args.backend) {
		var mod=module.split(".");
		//TODO: put in something so we can switch to python backends when desired
		var url = "../backend";
		for(var i=0; i <= mod.length-3; i++)
		{
			url += "/"+mod[i];
		}
		url += ".php?section="+escape(mod[mod.length-2]);
		url += "&action="+escape(mod[mod.length-1])
		args.url = url;
	}
	else if(args.app) {
		args.url = "../apps/"+args.app+"/"+args.url;
	}
	return dojo.xhrPost(args);
}