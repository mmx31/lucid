<?php
require("../backend/config.php");
if($_POST['appid'])
{
$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');
$query = "SELECT * FROM ${db_prefix}apps WHERE ID=${_POST['appid']} LIMIT 1";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());
while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {
$count = 1;
   foreach ($line as $col_value) {
if($count == 1) { $appid = $col_value; }
if($count == 2) { $name = stripslashes($col_value); }
if($count == 3) { $author = stripslashes($col_value); }
if($count == 4) { $email = stripslashes($col_value); }
if($count == 5) { $code = stripslashes($col_value); }
if($count == 6) { $library = stripslashes($col_value); }
if($count == 7) { $version = stripslashes($col_value); }
if($count == 8) { $maturity = stripslashes($col_value); }
if($count == 9) { $category = stripslashes($col_value); }
$count++;
   }
}
mysql_free_result($result);
mysql_close($link);
echo "<h3>Edit App</h3>";
}
else
{
//new app
$appid="-1";
$name="New App";
$library="//put your javascript library here. Don't forget to make it a class!!!";
$code="//put your javascript code here";
$maturity="Alpha";
$category="Office";
$version="1.0";
$author="Mr. Person";
$email="your@email.here";
echo "<h3>Create New App</h3>";
}
?>
<form action="index2.php?backend=saveapp" method="post">
<input type="hidden" name="appid" value="<?php echo $appid; ?>">
<table border="0" width="100%"><tr><td colspan="2">
<b>Name:</b><input type="text" name="name" value="<?php echo $name; ?>" style="width: 90%;">
</td><td colspan="2"><b>Maturity:</b>
<SELECT name="maturity">
<?php
if($maturity == "Stable") { echo "<OPTION selected>Stable</OPTION><OPTION>Beta</OPTION><OPTION>Alpha</OPTION>"; }
elseif($maturity == "Beta") { echo "<OPTION>Stable</OPTION><OPTION selected>Beta</OPTION><OPTION>Alpha</OPTION>"; }
elseif($maturity == "Alpha") { echo "<OPTION>Stable</OPTION><OPTION>Beta</OPTION><OPTION selected>Alpha</OPTION>"; }
else { echo "<OPTION>Stable</OPTION><OPTION>Beta</OPTION><OPTION selected>Alpha</OPTION>"; }
?>
</SELECT>
</td></tr>
<tr><td>
<b>Version: </b><input type="text" name="version" value="<?php echo $version; ?>" style="width: 90%;">
</td><td>
<b>Author: </b><input type="text" name="author" value="<?php echo $author; ?>" style="width: 90%;">
</td><td>
<b>Email: </b><input type="text" name="email" value="<?php echo $email; ?>" style="width: 90%;">
</td><td>
<b>Category:</b>
<SELECT name="category">
<?php
if($category == "Office") { echo "<OPTION selected>Office</OPTION><OPTION>Internet</OPTION><OPTION>System</OPTION>"; }
if($category == "Internet") { echo "<OPTION>Office</OPTION><OPTION selected>Internet</OPTION><OPTION>System</OPTION>"; }
if($category == "System") { echo "<OPTION>Office</OPTION><OPTION>Internet</OPTION><OPTION selected>System</OPTION>"; }
?>
</SELECT>
</td></tr>
<tr><td colspan="4"><b>Code:</b><br>
<textarea name="code" style="width: 100%; height: 500px;"><?php echo $code; ?></textarea>
</td></tr>
<tr><td colspan="4"><b>Library:</b><br>
<textarea name="library" style="width: 100%; height: 500px;"><?php echo $library; ?></textarea>
</td></tr>
<tr><td colspan="4"><input type="submit" value="save"> <input type="button" value="close" onclick="window.location='index2.php?backend=app'"></td></tr></table>
</form>