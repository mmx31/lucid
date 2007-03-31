<?php
$user = $_GET['user'];
require("../backend/config.php");
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');

$query = "UPDATE `${db_prefix}users` SET `logged` = '0' WHERE username ='${user}'";
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_close($link);
setcookie("userloggedin", "", time()-4000000);
header("Location: /index.php?opmessage=Logged+Out");
?>