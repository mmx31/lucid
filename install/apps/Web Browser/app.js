this.kill = function() {
	if(!this.win.closed) { this.win.close(); }
	api.instances.setKilled(this.instance);
}
this.init = function(args)
{
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.Form");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.layout.LayoutContainer");
	this.win = new api.window({
		title: "Web Browser",
		bodyWidget: "LayoutContainer",
		onClose: dojo.hitch(this, this.kill)
	});
	this.Iframe = document.createElement("iframe");
	dojo.style(this.Iframe, "width", "100%");
	dojo.style(this.Iframe, "height", "100%");
	dojo.style(this.Iframe, "border", "0px");
	this.urlbox = new dijit.form.TextBox({onExecute: dojo.hitch(this, this.go), style: "width: 90%;"});
	var form = new dijit.Toolbar({layoutAlign: "top"});
	form.addChild(this.urlbox);
	form.addChild(new dijit.form.Button({label: "Go", onClick: dojo.hitch(this, this.go), style: "width: 10%;"}));
	form.startup();
	this.win.addChild(form);
	var client = new dijit.layout.ContentPane({layoutAlign: "client"}, document.createElement("div"));
	client.setContent(this.Iframe);
	this.win.addChild(client);
	this.win.show();
	if(args.url) this.go(args.url);
	else this.go("http://www.google.com/");
	/*this.interval = setInterval(dojo.hitch(this, function() {
		var loc = this.Iframe.contentWindow.location;
		this.Iframe.top = {
			location: loc
		};
		if(loc != "about:blank") this.urlbox.setValue(loc);
	}), 500);*/
	api.instances.setActive(this.instance);
}

this.go = function(url)
{
	var URL = (typeof url == "string" ? url : this.urlbox.getValue());
	if(!(URL.charAt(4) == ":" && URL.charAt(5) == "/" && URL.charAt(6) == "/"))
	{
		//but wait, what if it's an FTP site?
		if(!(URL.charAt(3) == ":" && URL.charAt(4) == "/" && URL.charAt(5) == "/"))
		{
			//if it starts with an "ftp.", it's most likely an FTP site.
			if((URL.charAt(0) == "F" || URL.charAt(0) == "f") && (URL.charAt(1) == "T" || URL.charAt(1) == "t") && (URL.charAt(2) == "P" || URL.charAt(2) == "p") && URL.charAt(3) == ".")
			{
				URL = "ftp://"+URL;
			}
			else
			{
				//ok, it's probably a plain old HTTP site...
				URL = "http://"+URL;
			}
		}
	}
	this.Iframe.src = URL;
	this.urlbox.setValue(URL);
	return;
}