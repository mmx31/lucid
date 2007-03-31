<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Psych Desktop</title>

<style type="text/css">

#fadeinbox{
position:absolute;
width: 300px;
left: 0;
top: -400px;
border: 2px solid black;
background-color: #EEEEEE;
padding: 4px;
z-index: 100;
visibility:hidden;
}
body
{
  background-image: url("http://desktop.psychdesigns.net/images/wallpaper.jpg");
}
</style>
<script type="text/javascript" src="http://desktop.psychdesigns.net/javascript/popup.js"></script>
<script type="text/javascript">
var menuopen=0
//this will contain the menu contents
var description=new Array()
description[0]="<?php include 'http://desktop.psychdesigns.net/javascript/menu.php'; ?>"
</script>
<script type="text/javascript" src="http://desktop.psychdesigns.net/javascript/menu.js"></script>

<script type="text/javascript">
var appname="nonworking application"
</script>

</head>
<body>

<layer name="nsviewer" bgcolor="#DDDDDD" style="border-width:thin;z-index:1" onmouseout="clearTimeout(openTimer);stopIt()"></layer>
<script type="text/javascript">
if (iens6){
document.write("<div id='viewer' style='background-color:#EEEEEE;visibility:hidden;position:absolute;left:0;width:0;height:0;z-index:1;overflow:hidden;border:0px'></div>")
}
if (ns4){
	hideobj = eval("document.nsviewer")
	hideobj.visibility="hidden"
}
</script>

<!--taskbar-->
<table border=0 cellpadding=0 cellspacing=0 style="valign: center; z-index:2; position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; background: url(http://desktop.psychdesigns.net/images/header.gif)">
<tr>
<td style="width: 50px;"><a href="#" onclick="showMenu();" ><img src="http://desktop.psychdesigns.net/images/menu.gif" border="0"></a></td><td style="width: 4px;">|</td>
<td><center>
<table border=1 width=20% height=10><tr><td>
<script type=text/javascript>
count2=0
if(appname.length > 16)
{
while(16 != count2)
{
document.write(appname.charAt(count2));
count2++;
}
document.write("...");
}
else
{
document.write(appname);
}
//non-working app
</script>
</td></tr></table>
</center></td><td style="width: 4px;">|</td>
<td style="width: 160px;"><center>icon tray</center></td></tr></table>





<DIV id="fadeinbox" style="filter:progid:DXImageTransform.Microsoft.RandomDissolve(duration=1) progid:DXImageTransform.Microsoft.Shadow(color=gray,direction=135) ; -moz-opacity:0">

Welcome. This is an alpha version of Psych Desktop.<br><br>Enjoy!

<div align="right"> <a href="#" onClick="hidefadebox();return false">Dismiss</a>
</div>
</DIV>
</body>
</html>