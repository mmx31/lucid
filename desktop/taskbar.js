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
new Effect.Fade('taskbar');
taskbarvisibility = "hide";
Element.update('taskbarhider', '<img src="./icons/showtask.gif">');
if(menuvisibility == "open")
{
//menubutton();
}
}
else
{
if(taskbarvisibility == "hide")
{
new Effect.Appear('taskbar');
taskbarvisibility = "show";
Element.update('taskbarhider', '<img src="./icons/hidetask.gif">');

}
}
}

function drawtaskbar()
{
//change this later so it's dynamic
Element.update('taskbar', '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td width="30"><img src="./icons/apps.gif" onClick="menubutton();" border="0"></td><td width="1%"><img src="./images/separator.gif"></td><td></td><td><table><tr id="appbar"><td width="1">&nbsp</td></tr></table></td><td width="1%"><img src="./images/separator.gif"></td><td width="15%"><table id="tasktray"><tr><td></td></tr></table></td></tr><table>');
}