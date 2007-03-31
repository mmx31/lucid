<?php
require("../backend/config.php");
if($_POST['uid'])
{
$uid = $_POST['uid'];

$link = mysql_connect($db_host, $db_username, $db_password)
   or die('Could not connect: ' . mysql_error());
mysql_select_db($db_name) or die('Could not select database');

$query = "SELECT ID FROM ${db_prefix}users WHERE username = '${uid}'";
$result = mysql_query($query) or die('Query failed: ' . mysql_error());

 if($result)
{
while ($line = mysql_fetch_array($result, MYSQL_ASSOC))
 {
 foreach($line as $col_value)
 {
  if($col_value)
  {
   if($conf_user_logged == $uid)
{
delete_error("deleteself");
}
else
{
  $query = "DELETE FROM `${db_prefix}users` WHERE username = '${uid}'";
  mysql_query($query) or die('Query failed: ' . mysql_error());
  echo "<script type='text/javascript'> window.location='./index2.php?opmessage=User+Deleted&backend=users'</script>";
  exit();
}
  }
 }
}

  delete_error("nonexistant");
  exit();
}
}
else
{
delete_error("nodata");
}

mysql_free_result($result);
mysql_close($link);


function delete_error($reason)
{
if($reason=="nodata")
{
echo "<script type='text/javascript'> window.location='./index2.php?opmessage=ERROR:+No+Data+Submitted&backend=users'</script>";
}
if($reason=="nonexistant")
{
echo "<script type='text/javascript'> window.location='./index2.php?opmessage=ERROR:+Non-existant+User&backend=users'</script>";
}
if($reason=="deleteself")
{
echo "<script type='text/javascript'> window.location='./index2.php?opmessage=ERROR:+You+Can't+Delete+Yourself!&backend=users'</script>";
}
if($reason=="baddata")
{
echo "<script type='text/javascript'> window.location='./index2.php?opmessage=ERROR:+Bad+Data+Submitted&backend=users'</script>";
}

}

?>