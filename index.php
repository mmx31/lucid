<?php
if($_GET['page'] == "register" || $_GET['page'] == "forgotpass" || $_GET['page'] == "editaccount")
{
session_start();
global $code;
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Psych Desktop</title>
<link rel="stylesheet" href="./Steely.css" type="text/css">
</head>
<body>
<table border= "0" width="100%" cellpadding= "0" cellspacing= "0" style="background-image: url('../images/header.gif'); position: absolute; top: 0px; left: 0px;">
<tr>
<td>
<img src="../images/logo.gif">
</td>
</tr>
</table>
<table height="70" width="100%" border="0"><tr><td></td></tr></table>
<?php
if($_GET['opmessage'])
{
echo "<center><span style='color: red;'>${_GET['opmessage']}</span></center>";
}
if($_GET['page'])
{
include("${_GET['page']}.php");
}
else
{
include("./front.php");
}

?>
</body>
</html>