/****************************\
|        Psych Desktop       |
|    Window Engine Library   |
|   (c) 2006 Psych Designs   |
\****************************/ 

window.onresize = windows_desktopResize;
setTimeout("windows_desktopResize();", 1500);
function windows_desktopResize()
{
	if(document.body.clientWidth) { x=document.body.clientWidth }
	if(window.innerWidth) { x=window.innerWidth }
	if(document.body.clientHeight) { y=document.body.clientHeight }
	if(window.innerHeight) { y=window.innerHeight }
	document.getElementById("windowcontainer").style.width= x;
	if(taskbarvisibility == "show")
	{
		document.getElementById("windowcontainer").style.height= y-35;
	}
	else
	{
		document.getElementById("windowcontainer").style.height= y;
	}
}

function newWindow(wintitle, contents, winwidth, winheight)
{
windiv=document.createElement("div");
windiv.style.position="absolute";
windiv.style.top = "10%";
windiv.style.left = "5%";
windiv.style.width=winwidth;
windiv.style.height=winheight;
windiv.style.zindex="100";
windiv.innerHTML=contents;
document.getElementById("windowcontainer").appendChild(windiv);
widget = dojo.widget.createWidget("FloatingPane", {hasShadow: true, resizable: true, displayCloseAction: true, title: wintitle, displayMaximizeAction: true, displayMinimizeAction: true, taskBarId: "appbar", toggle: "explode", toggleDuration: 300, constrainToContainer: true}, windiv);
}