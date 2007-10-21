<?php
require("../backend/config.php");
if($_POST['deleteid'])
{
$query = "DELETE FROM ${db_prefix}apps WHERE ID=\"${_POST['deleteid']}\" LIMIT 1";

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
echo 'Connected successfully';
mysql_select_db($db_name) or die('Could not select database');
mysql_query($query) or die('Query failed: ' . mysql_error());
mysql_free_result($result);
mysql_close($link);
echo "<script type='text/javascript'>window.location='index2.php?backend=app&opmessage=App+Deleted'</script>";
exit();
}
echo "<form action='index2.php?backend=editapp' method='post'><b>Edit app ID:</b><input name='appid' type='inputbox'><input type='submit' value='edit'></form> <form action='index2.php?backend=app' method='post'><b>Delete app ID:</b><input name='deleteid' type='inputbox'><input type='submit' value='delete'></form> <a href='index2.php?backend=editapp'>new app</a> <a href='index2.php?backend=uploadapp'>Upload appPackage</a>";
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "SELECT * FROM ${db_prefix}apps";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
echo "<table border=\"1\" width=\"100%\">\n";
echo "<tr><td><b>ID</b></td><td><b>Name</b></td><td><b>Author</b></td><td><b>email</b></td><td><b>version</b></td><td><b>maturity</b></td><td><b>category</b></td></tr>";
while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
   echo "\t<tr>\n";
$count = 1;
   foreach ($line as $col_value) {
if($count != 5)
{
       echo "\t\t<td>";
       echo stripslashes($col_value);
       echo "</td>\n";
}
$count++;
   }
   echo "\t</tr>\n";
}
echo "</table>\n";
mysql_free_result($result);
mysql_close($link);
?> 
