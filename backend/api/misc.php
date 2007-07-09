<?php

require("../config.php");
if (isset($_GET['action'])) {
// get password will NEVER be implamented
 if ($_GET['action'] == "getStatus") {
if(isset($_SESSION['userid'])) {
echo("OK");
}
else {
echo("FAIL");
}
}
 if ($_GET['action'] == "getUserName") {
 echo $_SESSION['username'];
 }
 if ($_GET['action'] == "getUserNameFromID") {
 $userid = $_GET["userid"]; 
	$query = "SELECT * FROM ${db_prefix}users WHERE ID=\"${userid}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		echo($_row["username"]);
		}
 }
 if ($_GET['action'] == "getUserIDFromName") {
 $username = $_GET["username"]; 
	$query = "SELECT * FROM ${db_prefix}users WHERE username=\"${username}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		echo($_row["ID"]);
		}
 }
 if ($_GET['action'] == "getUserID") {
 echo $_SESSION['userid'];
 }
  if ($_GET['action'] == "getUserLevel") {
  echo $_SESSION['userlevel'];
  }
  }
?>