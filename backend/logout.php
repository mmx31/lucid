<?phpif (session_id() == "") session_start(); // if no active session we start a new one
$user = $_SESSION['username'];
require("../backend/config.php");
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "UPDATE `${db_prefix}users` SET `logged` = '0' WHERE username='${user}'";
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_close($link);
setcookie("userloggedin", "", time()-4000000);
session_destroy();
?>
<html>
<head><title>Logged Out</title></head>
<body>
<div style="height: 30%; width: 100%;">&nbsp</div>
<center>
<div style="border: 1px solid black; background: #EEEEEE; width: 30%;"><center><h3>Logged Out</h3><br>
<input type=button value="Close Window" onClick="javascript:window.close();">
</center></div>
</center>
<script type="text/javascript">
window.close();</script></body></html>