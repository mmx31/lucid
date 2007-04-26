/****************************\
|        Psych Desktop       |
|       Taskbar Engine       |
|   (c) 2006 Psych Designs   |
\***************************/ 

taskbarvisibility = "show";

function taskbarhider()
{
if(taskbarvisibility == "show")
{
//new Effect.Fade('taskbar');
dojo.lfx.html.fadeOut('taskbar', 300).play();
taskbarvisibility = "hide";
document.getElementById("taskbarhider").innerHTML='<img src="./icons/showtask.gif">';
if(menuvisibility == "open")
{
//menubutton();
}
}
else
{
if(taskbarvisibility == "hide")
{
//new Effect.Appear('taskbar');
dojo.lfx.html.fadeIn('taskbar', 300).play();
taskbarvisibility = "show";
document.getElementById("taskbarhider").innerHTML='<img src="./icons/hidetask.gif">';
}
}
windows_desktopResize();
}

function drawtaskbar()
{
appbarcontent = "&nbsp;";
//appbarcontent = '<div dojoType="TaskBar" id="appbar"></div>';
setTimeout("document.getElementById(\"taskbar\").innerHTML='<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"><tr><td width=\"30\"><img src=\"./icons/apps.gif\" onClick=\"menubutton();\" border=\"0\"></td><td width=\"1%\"><img src=\"./images/separator.gif\"></td><td>"+appbarcontent+"</td><td width=\"1%\"><img src=\"./images/separator.gif\"></td><td width=\"15%\"></td></tr><table>';", 100);

/*
bar=document.createElement("div");
bar.ID="appbar";
bar.style.height="50px";
bar.style.width="80%";
document.body.appendChild(bar);
widget = dojo.widget.createWidget("TaskBar", {hasShadow: false, resizable: false}, bar);
*/

}