/** 
* An API that provides things like dialogs and such
* TODO: document this
* TODO: this should use the window api. Untill then it will not be loaded.
* 
* @classDescription An API that provides things like dialogs and such
* @memberOf api
*/
api.ui = new function() {
	this.alert = function(object)
	{
		dojo.require("dijit.Dialog");
		var div = dojo.doc.createElement("div");
		div.innerHTML = "<center> "+object.message+" </center>";
		var box = new dijit.Dialog({title: "Alert"}, div);
		box.show();
}
}