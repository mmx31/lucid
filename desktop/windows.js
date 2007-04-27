/****************************\
|        Psych Desktop       |
|    Window Engine Library   |
|   (c) 2006 Psych Designs   |
\****************************/ 

window.onresize = windows_desktopResize;
setTimeout("windows_desktopResize();", 1500);
var windowcounter = 0;
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