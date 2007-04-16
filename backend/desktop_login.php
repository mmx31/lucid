<?php
$action = "../desktop/index.php";$autologin = false;
require("./config.php");

if((isset($_COOKIE["autologin"])))
{
	$cookie = $_COOKIE["autologin"];
	$cookie = explode(",", $cookie);
	$username = $cookie[0];
	$passhash = $cookie[1];
	$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\" AND password=\"${$passhash}\" LIMIT 1";
	$link = mysql_connect($db_hostname, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	if(isset($result))
	{
		$autologin = true;
	}	
}

?>
<html>
<head>
<title>Log In</title>
</head>
<body>
<div style="color: red; height: 30%; width: 100%;">
<div style="height: 70%; width: 100%;">&nbsp</div>
<center><h3>
<?php echo $_GET['opmessage']; ?>
</h3></center>
</div>
<center><div style="border: 1px solid black; background: #EEEEEE; width: 280px;"><center><h3>Log In</h3><br>
<form action="<?php echo $action; ?>" method="post" id="loginform">
Username:<input type="text" id="user" name="user"><br>
Password:<input type="password" id="password" name="pass">
<br />
Auto-Login:<input type="checkbox" name="remember" value="yes">

<br />

<input type="submit" value="Login"><input type="button" onClick="window.close();" value="Cancel"><input type="hidden" id="autologin" name="autologin" value="0" />
<input type="hidden" id="passhash" name="passhash" />
</form>
<p>For the best experience, your browser should be on full screen mode<br>(usually the 'F11' key)</p>
</center></div></center>
<?php
if($autologin == true)
{
	echo "<script type='text/javascript'>\n";
	echo "document.getElementById('user').value='$username'\n";
	echo "document.getElementById('passhash').value='$passhash'\n";
	echo "document.getElementById('autologin').value='1'\n";
	echo "document.getElementById('loginform').submit();\n";
	echo "</script>\n";
}
?>

</body>
</html>