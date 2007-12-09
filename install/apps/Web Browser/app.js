this.kill = function() {
	if(!this.window.destroyed) { this.window.destroy(); }
	this.status = "killed";
}
this.windowKill = function() {
	this.kill();
}
this.init = function(args)
{
this.window = new api.window();
this.window.write('<form name="submitbox" action="#" onSubmit="return desktop.app.instances['+this.instance+'].go()" >');
this.window.write('<form name="submitbox" action="#" onSubmit="return desktop.app.instances['+this.instance+'].go()" >');
this.window.write('<input type="text" id="browserUrlBox'+this.instance+'" value="http://www.google.com/" style="width: 94%;" />');
this.window.write('<input type="button" value="Go" onClick="desktop.app.instances['+this.instance+'].go()" style="width: 6%;"><br />');
this.window.write('<iframe style="width: 99%; height: 90%; background-color: #FFFFFF;" src="http://www.google.com" id="browserIframe'+this.instance+'" /></form>');
this.window.title="Web Browser";
this.window.height="420px";
this.window.width="500px";
this.window.show();
this.status = "active";
this.window.onDestroy = dojo.hitch(this, this.windowKill);
if(args.url) this.go(args.url)
}

this.go = function(url)
{
urlbox = document.getElementById("browserUrlBox"+this.instance);
URL = (url || urlbox.value);
if(URL.charAt(4) == ":" && URL.charAt(5) == "/" && URL.charAt(6) == "/")
{
}
else
{
//but wait, what if it's an FTP site?
if(URL.charAt(3) == ":" && URL.charAt(4) == "/" && URL.charAt(5) == "/")
{
}
else
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
Iframe = document.getElementById("browserIframe"+this.instance);
Iframe.src = URL;
urlbox.value = URL;
return false;
}