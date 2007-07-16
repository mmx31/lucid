/** 
* An API that provides things like dialogs and such
* TODO: document this
* TODO: this should use the window api. Untill then it will not be loaded.
* 
* @classDescription An API that provides things like dialogs and such
* @memberOf api
*/
api.ui = new function() {
	this.dialog = function()
	{
		this.id = "win"+windowcounter;
		this.question = "Is this developer a noob?";
		this.callback = api.toaster;
		this.yesvalue = "Yes";
		this.novalue  = "No";
		this.show = function() {
			this.innerHTML = "<center> "+this.question+"</center> <p> <input type=\"button\" onClick=\""+this.callback+"('yes');\" value=\""+this.yesvalue+"\"> <input type=\"button\" onClick=\""+this.callback+"('no');\" value=\""+this.novalue+"\">";
			windiv=document.createElement("div");
	    		windiv.style.position="absolute";
	    		windiv.style.top = "5%";
	    		windiv.style.left = "5%";
	    		windiv.style.width=this.width;
	    		windiv.style.height=this.height;
	    		windiv.style.zindex="100";
	    		windiv.innerHTML=this.innerHTML;
	    		document.getElementById("windowcontainer").appendChild(windiv);
	    		this.window = dojo.widget.createWidget("FloatingPane", {
	    			hasShadow: true,
	    			resizable: false,
	    			title: "Question",
	    			constrainToContainer: true,
				templatePath: dojo.uri.dojoUri("../themes/default/window.html"),
				templateCssPath: dojo.uri.dojoUri("../themes/default/window.css"),
				titleBarDisplay: false,
				hasShadow: true,
	                id: this.id
	    		}, windiv);		
		}
	    	this.destroy = function()
	    	{
	    		if(this.window) { this.window.destroy(); }
	    		else { api.toaster("Warning in app: No window shown."); }
	    	}
		}
}