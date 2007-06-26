<?php
require("../backend/config.php");
if(!$_POST['appid'])
{
echo "<script type='text/javascript'>window.location='index2.php?backend=app&opmessage=Error:+No+App+Id+Recieved'</script>";
exit();
}

$link = mysql_connect($db_host, $db_username, $db_password)   or die('Could not connect: ' . mysql_error());mysql_select_db($db_name) or die('Could not select database');
$_POST['name'] = mysql_real_escape_string (str_replace("[==separator==]", " ", $_POST['name']), $link);$_POST['author'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['author']), $link);$_POST['email'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['email']), $link);$_POST['code'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['code']), $link);$_POST['version'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['version']), $link);$_POST['maturity'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['maturity']), $link);$_POST['category'] = mysql_real_escape_string (str_replace("[==separator==]", " ",$_POST['category']), $link);
if($_POST['appid'] == -1)
{
//INSERT$query = "INSERT INTO ${db_prefix}apps (name, author, email, code, version, maturity, category) VALUES(\"${_POST['name']}\", \"${_POST['author']}\", \"${_POST['email']}\", \"${_POST['code']}\", \"${_POST['version']}\", \"${_POST['maturity']}\", \"${_POST['category']}\")";}
else
{
$query = "UPDATE ${db_prefix}apps  SET name=\"${_POST['name']}\", author=\"${_POST['author']}\", email=\"${_POST['email']}\", code=\"${_POST['code']}\", version=\"${_POST['version']}\", maturity=\"${_POST['maturity']}\", category=\"${_POST['category']}\" WHERE ID=\"${_POST['appid']}\" LIMIT 1";
}
mysql_query($query) or die('Query failed: ' . mysql_error());mysql_close($link);echo "<script type='text/javascript'>window.location=\"./index2.php?backend=app&opmessage=App+Saved+Successfully\"</script>";?>