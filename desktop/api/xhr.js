api.xhr = function(/*dojo.__ioArgs*/args) {
	if(args.backend) {
		var mod=args.backend.split(".");
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
	var callback = args.load;
	args.load = function(data, ioArgs) {
		if(typeof parseInt(data) == "number" && parseInt(data) > 0) {
			console.error(data); //TODO: we should alert the user in some cases, or possibly retry the request
		}
		callback.apply(args.context || window, arguments);
	}
	return dojo.xhrPost(args);
}