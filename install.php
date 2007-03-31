<?php
//install script

if($post['submitted'])
{
?>
<html>
<head>
<title>Installing...</title>
</head>
<body>
<h1>Psych Desktop Installation</h1>
<h3>installing...</h3>
<?php
if($post['db_host'] && $post['db_name'] && $post['db_user'] && $post['db_pass'] && $post['db_prefix'] && $post['username'] && $post['password'])
{
}
else
{
echo "<b>Error: not all information entered!</b><br><a href='javascript: history.back()'>Go Back</a></body></html>";
exit();
}
echo "<br><b>Writing config...</b>";
//insert config writing stuff here
echo "done.";
echo "<br><b>Configuring DB...</b>";
//insert DB stuff here
echo "done.";

echo "<h4>Done. Please make sure you delete /install.php and /desktop.sql before using the desktop!</h4>";
echo "<a href='./index.php'>Continue to homepage</a>";
echo "<a href='./admin/index.php'>Go to administrator panel</a>";
echo "</body>\n</html>";
}
else
{
?>
<html>
<head>
<title>Psych Desktop Installation</title>
</head>
<body>
<h1>Psych Desktop Installation</h1>
<?php
if(/*not able to write to file*/) { echo "<b>Error: cannot write to config file. Be sure to chmod it to 777"; $ready == 0; } else { $ready == 1; }
?>
<form action="./install.php">
<input type="hidden" name="submitted" value="1">
<input type="hidden" name="md5hash" value="<?php echo crypt("cryptme!"); ?>">
DB Host: 
<input type="text" name="db_host">
<br>
DB name: 
<input type="text" name="db_name">
<br>
DB user: 
<input type="text" name="db_user">
<br>
DB password: 
<input type="text" name="db_pass">
<br>
DB table prefix: 
<input type="text" name="db_prefix">
<br>
Admin's desired username: 
<input type="text" name="username">
<br>
Admin's desired password: 
<input type="text" name="password">
<br>
<?php if($ready == 1) { echo '<input type="submit">'; } ?>
</form>
</body>
</html>
<?php
}
?>
