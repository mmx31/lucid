<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
	*/
session_start();
if (isset($_GET['crosstalk'])) {
 $userid = $_SESSION['userid'];
    if ($_GET['crosstalk'] == "checkForEvents")
    {
    header('Content-type: text/xml');
	include("config.php");
        $appID = $_GET['appID'];
	$query = "SELECT * FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND appID=\"${appID}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$output = "<?xml version='1.0' encoding='utf-8' ?>" . "\r\n" . "<crosstalkEvents>";
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		$appid = $row["appID"];
		$sender = $row["sender"];
		$message = $row["message"];
		$output .=  "\r\n" . '<event sender="'. $row["sender"] . '" appID="'. $row["appID"] .'">'. $row["message"] .'</event>';
		$query = "DELETE FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND appID=\"${appid}\" AND message=\"${message}\"";
		mysql_query($query) or die('Query failed: ' . mysql_error());
		}		
	$output .=  "\r\n" . "</crosstalkEvents>";	
	echo($output);
}
    if ($_GET['crosstalk'] == "sendEvent")
    {
	include("config.php");
    $message = $_GET["message"];
    $sender = $userid;
    $destination = $_GET["destination"];
    $appID = $_GET["appID"];
    $query = "INSERT INTO `${db_prefix}crosstalk` (userid, message, sender, appID) VALUES('${sender}', '${message}', '${destination}', '${appID}');";
    $link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('Could not select database');
    mysql_query($query) or die('Query failed: ' . mysql_error());
    echo("OK.");
}
}
if (isset($_GET['action'])) {
    if ($_GET['action'] == "getDatabase")
    {
		require("config.php");
        $query = "SELECT * FROM `${db_prefix}database` WHERE appid='${_GET['appid']}' AND userid='${_SESSION['userid']}' AND tablename='${_GET['tablename']}' LIMIT 1";
	    $link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	    mysql_select_db($db_name) or die('Could not select database');
	    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
			echo $row['columns'] . "-|-" . $row['values'];
		}
    }
    if ($_GET['action'] == "saveDatabase")
    {
		require("config.php");
        $columns = $_POST['columns'];
        $table = $_POST['table'];
        $name = $_POST['name'];
        $appid = $_POST['appid'];
        $public = $_POST['pub'];
		$userid = $_SESSION['userid'];
		$query = "REPLACE INTO `${db_prefix}database` (`userid`, `appid`, `public`, `tablename`, `columns`, `values`) VALUES('${userid}', '${appid}', '${public}', '${name}', '${columns}', '${table}')";
	    $link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	    mysql_select_db($db_name) or die('Could not select database');
	    mysql_query($query) or die('Query failed: ' . mysql_error());
    }
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
	
if (isset($_GET['registry'])) { 
	if ($_GET['registry'] == "load") {
	// stable registry value loading system - jaymacdonald and psychiccyberfreak
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
	// stable registry value saving system - jaymacdonald and psychiccyberfreak
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
	elseif ($_GET['registry'] == "remove") {
		// alpha registry value remover - jaymacdonald
		include("config.php");
		$userid = $_SESSION['userid'];
		$appid = $_GET['appid'];
		$varname = $_GET['varname'];
		$query = "DELETE FROM ${db_prefix}registry WHERE userid=\"${userid}\" AND appid=\"${appid}\" AND varname=\"${varname}\"";
		$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		mysql_select_db($db_name) or die('Could not select database');
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		}
	else {
	// not a valid registry command
	echo("ERR"); 
	}
}
?>
