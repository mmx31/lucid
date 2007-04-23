<?php
require("../backend/config.php");

?>

<FORM action="index2.php?backend=dodeleteuser" method="post">
<a href='index2.php?backend=newuser'>New User</a>&nbsp&nbsp|&nbsp&nbsp
<b>Delete User:</b>  
&nbsp;&nbsp;ID: <INPUT type="text" name="uid">
<INPUT type="submit" value="delete">
</FORM>
<?php

// Connecting, selecting database
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');

// Performing SQL query
$query = "SELECT * FROM ${db_prefix}users";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());

// Printing results in HTML
echo "<table width='100%' border='1'>\n";
echo "<thead>\n";
echo "<tr>\n";
echo "<td>\n";
echo "Username\n";
echo "</td>\n";
echo "<td>\n";
echo "E-mail\n";
echo "</td>\n";
echo "<td>\n";
echo "MD5 sum of Password\n";
echo "</td>\n";
echo "<td>\n";
echo "Logged In?\n";
echo "</td>\n";
echo "<td>\n";
echo "ID\n";
echo "</td>\n";
echo "<td>\n";
echo "Level\n";
echo "</td>\n";
echo "</tr>\n";
echo "</thead>\n";
$count = 1;
while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
   echo "\t<tr>\n";

   echo "\t<tr>\n";
   foreach ($line as $col_value) {
       echo "\t\t<td>$col_value</td>\n";
   }
   echo "\t</tr>\n";
}
echo "</table>\n";


// Free resultset
mysql_free_result($result);

// Closing connection
mysql_close($link);
?> 