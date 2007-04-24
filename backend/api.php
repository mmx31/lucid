<?php
session_start();
if (isset($_GET['fs'])) {
 if ($_GET['fs'] == "load") {
	// prototype file system loader - jaymacdonald
	include("config.php");
	$userid = $_SESSION['userid'];
	$file = $_GET['file'];
	$directory = $_GET['directory'];
	$query = "SELECT * FROM ${db_prefix}filesystem WHERE userid=\"${userid}\" AND file=\"${file}\" AND directory=\"${directory}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$row = mysql_fetch_array($result, MYSQL_ASSOC);
	$reallocation = $row['location'];
	$file = file_get_contents("../files/$reallocation");
	echo($file);
	}
	if ($_GET['fs'] == "list") {
	// prototype file system loader - jaymacdonald
	include("config.php");
	$userid = $_SESSION['userid'];
	$file = $_GET['file'];
	$directory = $_GET['directory'];
	$query = "SELECT * FROM ${db_prefix}filesystem WHERE userid=\"${userid}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$tmp = 0;
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	$directory = $row['directory'];
	$file = $row['file'];
	echo($directory);
	echo($file);
	    if($tmp+1 != mysql_numrows($result)) {
		echo "[==separator==]";
		}
        $tmp++;
	}
	}
	}
	
if (isset($_GET['registry'])) { 
	if ($_GET['registry'] == "load") {
	// prototype registry value loading system - jaymacdonald
		include("config.php");
		$userid = $_SESSION['userid']; 
		$appid = $_GET['appid'];
		$varname = $_GET['varname'];
		$query = "SELECT * FROM ${db_prefix}registry WHERE userid=\"${userid}\" AND appid=\"${appid}\" AND varname=\"${varname}\"";
		$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		mysql_select_db($db_name) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		$row = mysql_fetch_array($result, MYSQL_ASSOC);
			echo $row['value'];	//give the result :D
	}
	elseif ($_GET['registry'] == "save") {
	// prototype registry value saving system - jaymacdonald
		include("config.php");
		$userid = $_SESSION['userid'];
		$appid = $_GET['appid'];
		$varname = $_GET['varname'];
		$value = $_GET['value'];
		$query = "SELECT * FROM ${db_prefix}registry WHERE appid=\"${appid}\" AND varname=\"${varname}\" HAVING userid=\"${userid}\" LIMIT 1";
		$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		mysql_select_db($db_name) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = mysql_fetch_array($result, MYSQL_ASSOC))
		{
			$ID = $row["ID"];
			$query = "REPLACE INTO `${db_prefix}registry` VALUES('${ID}', '${userid}', '${appid}', '${varname}', '${value}');";
			$returned = "I was set yay!";
		}
		if($returned != "I was set yay!") { $query = "INSERT INTO `${db_prefix}registry` (userid, appid, varname, value) VALUES('${userid}', '${appid}', '${varname}', '${value}');"; }
		mysql_query($query) or die("Query failed: " . mysql_error());
		echo "OK.";
	}
	else {
	// not a valid registry command
	echo("ERR"); 
	}
}
?>