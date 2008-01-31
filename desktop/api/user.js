/** 
* An API that gets user info and such
* TODO: condense this so that the callbacks are not seperate functions. Also document this.
* 
* @classDescription An API that gets user info and such
* @memberOf api
*/
api.user = new function()
{
	this.get = function(options) {
		if(!options.id) { options.id = "0"; }
		api.xhr({
	        backend: "api.misc.user.get",
			content: {
				id: options.id
			},
	        load: function(data, ioArgs) {
				data = dojo.fromJson(data);
	        	if(options.callback) { options.callback(data); }
			}
        });
	}
}