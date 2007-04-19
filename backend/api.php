<?php
session_start();

	if (isset($_GET['registry'])) { 
	if ($_GET['registry'] == ("load")) {
	// prototype registry value loading system - jaymacdonald
		include("config.php");
		$userid = $_SESSION['userid']; // no longer a security risk
		$appid = $_GET['appid'];
		$varname = $_GET['varname'];
		$query = "SELECT * FROM ${db_prefix}registry WHERE userid=\"${userid}\" AND appid=\"${appid}\" AND varname=\"${varname}\"";
		$link = mysql_connect($db_hostname, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		mysql_select_db($db_name) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = mysql_fetch_array($result, MYSQL_ASSOC))
		{
			echo($row['value']);	//give the result :D
		}
	}
	else if ($_POST['registry'] == ("save")) {
	// prototype registry value saving system - jaymacdonald
		include("config.php");
		$userid = $_SESSION['userid']; // no longer a security risk
		$appid = $_POST['appid'];
		$varname = $_POST['varname'];
		$query = "SELECT * FROM ${db_prefix}registry WHERE appid=\"${appid}\" AND varname=\"${varname}\" LIMIT 1";
		$link = mysql_connect($db_hostname, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		mysql_select_db($db_name) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
				while ($row = mysql_fetch_array($result, MYSQL_ASSOC))
		{
			if($row["varname"] != ($null)) {
			$ID = $row["ID"];
			$query = "REPLACE INTO `${db_prefix}registry` VALUES (${ID},${userid},${appid},${varname},${value});"
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	}
	else {
			$ID = $row["ID"];
			$query = "INSERT INTO `${db_prefix}registry` VALUES (${userid},${appid},${varname},${value});"
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	}
	}
	}
	else {
	// not a valid registry command
	echo("ERR"); 
	}
	}
?>