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
	else if ($_GET['registry'] == ("save")) {
	//save a registry value
	}
	else {
	// not a valid registry command
	echo("ERR"); 
	}
	}
?>