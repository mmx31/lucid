<?php
$action = "../desktop/index.php";
if($_GET['subdir'])
{
$action = "../".$_GET['subdir']."/index.php";
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
<form action="<?php echo $action; ?>" method="post">
Username:<input type="text" name="user"><br>
Password:<input type="password" name="pass">
<br>
<input type="submit" value="Login"><input type="button" onClick="window.close();" value="Cancel">
</form>
<p>For the best experience, your browser should be on full screen mode<br>(usually the 'F11' key)</p>
</center></div></center>
</body>
</html>