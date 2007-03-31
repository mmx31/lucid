<?php
//any needed frontpage crap here
?>
<SCRIPT LANGUAGE="JavaScript">
function popUp(URL) {
day = new Date();
id = day.getTime();
eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=768,left = 0,top = 0,fullscreen=1');");
}
</script>
<table width="100%"><tr><td>
<div><h2><font face="Verdana">Welcome to Psych Desktop!</font></h2><font face="Verdana"> </font><p><font face="Verdana">Psych Desktop is a web operating system.<br>note that we are not testing on IE, and don't plan on doing so for a while.<br>please don't complain saying it dosn't work, because it's a work in progress.</font></p></div></td>


<td width="50%" valign="top" align="center">
<div style="height: 10%">&nbsp</div>
<div style="border: 1px grey solid; background-color: #EEEEEE;">
<center>
<p>
<input type=button value="Launch Desktop" onClick="javascript:popUp('./backend/desktop_login.php')">
<br><b>or</b><br>
<input type=button value="Try experemental dojo powered Desktop" onClick="javascript:popUp('./backend/desktop_login.php?subdir=dojodesktop')">
</p>
<p>
Don't have an account? <a href="index.php?page=register">Register Here</a>
<br>
<a href="index.php?page=forgotpass">Forgot your password?</a><br>
<a href="index.php?page=editaccount">Edit your account here</a><br>
<a href="index.php?page=requirements">System Requirements</a>
</p>

</center>
</div>

</td>

</tr><tr><td width="50%" valign="top" colspan="1"><div><font face="Verdana">Some basic features:</font></div><div><font face="Verdana">&nbsp;</font></div>
<div><font face="Verdana"><img width="20" height="20" title="" alt="" src="/images/UI/plus.gif"></font>&nbsp; <font face="Verdana">File Manager</font></div><div><font face="Verdana"><img width="20" height="20" title="" alt="" src="images/UI/plus.gif"> Application Development API</font></div><div><font face="Verdana"><img width="20" height="20" title="" alt="" src="images/UI/plus.gif"> <em>more comming soon...</em></font><font face="Verdana"></font></div></td><td width="50%" valign="top" align="center" colspan="1"></td></tr></tbody></table>