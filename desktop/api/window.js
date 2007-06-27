api.windowcounter = 0;
api.window = function()
{
	this.id = "win"+api.windowcounter;
	api.windowcounter++;
	this.innerHTML = "";
	this.height = "400px";
	this.width = "500px";
	this.title = "";
	//this.templatePath = dojo.uri.dojoUri("../themes/default/window.html");
	//this.templateCssPath = dojo.uri.dojoUri("../themes/default/window.css");
	this.titleBarDisplay = true;
	this.hasShadow = true;

	this.resizable = true;
	this.empty = function()
	{
		this.window.innerHTML = "";
		if(document.getElementById(this.id))
		{
			document.getElementById(this.window.id).innerHTML = "";
		}
	}
	this.write = function(string)
	{
		this.innerHTML += string;
		if(document.getElementById(this.id))
		{
			document.getElementById(this.id).innerHTML += string;
		}		
	}
	this.show = function()
	{
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
			resizable: this.resizable,
			displayCloseAction: true,
			title: this.title,
			displayMaximizeAction: true,
			displayMinimizeAction: true,
			taskBarId: "appbar",
			toggle: "explode",
			toggleDuration: 300,
			constrainToContainer: true,
		templatePath: dojo.uri.dojoUri("../themes/default/window.html"),
		//templateCssPath: dojo.uri.dojoUri("../themes/default/window.css"),
		templateCssPath: null,
		templateCssString: "",
		templateString: "",
		titleBarDisplay: this.titleBarDisplay,
		hasShadow: this.hasShadow,
            id: this.id
		}, windiv);		
	}
	this.destroy = function()
	{
		if(this.window) { this.window.destroy(); }
		else { api.toaster("Warning in app: No window shown."); }
	}
    this.addChild = function(node)
    {
        this.window.addChild(node);
    }
}   