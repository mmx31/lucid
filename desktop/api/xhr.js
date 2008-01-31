djConfig.usePlainJson=true;

api.xhr = function(/*dojo.__ioArgs|String*/args) {
	var backend = function(str) {
		var mod=str.split(".");
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
	if(dojo.isString(args)) {
		//if we just need to get a module url, pass a string
		return backend(args);
	}
	if(args.backend) {
		args.url = backend(args.backend);
	}
	else if(args.app) {
		args.url = "../apps/"+args.app+"/"+args.url;
	}
	else if(args.xsite) {
		args.url = "../backend/api/xsite.php?path="+encodeURIComponent(args.url);
	}
	var callback = args.load;
	args.load = function(data, ioArgs) {
		if(typeof parseInt(data) == "number" && parseInt(data) > 0) {
			console.error(data); //TODO: we should alert the user in some cases, or possibly retry the request
		}
		callback.apply(dojo.global, arguments);
	}
	//comment filtering is tricky in certain cases...
	//if(args.handleAs == "json") {
	//	args.handleAs="json-comment-filtered";
	//}
	return dojo.xhrPost(args);
}