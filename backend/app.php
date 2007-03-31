<?php
if(!$_GET['id'])
{
exit();
}
require("config.php");
$link = mysql_connect($db_hostname, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "SELECT * FROM ${db_prefix}apps WHERE id=\"${_GET['id']}\" LIMIT 1";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
   foreach ($line as $col_value) {
       echo stripslashes($col_value);
       //echo $col_value;
       echo "[==separator==]";
   }
}
mysql_free_result($result);
mysql_close($link);
?>