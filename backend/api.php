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
        $appid = $_GET['appID'];
	$query = "SELECT * FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND appID=\"${appID}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$output = "<?xml version='1.0' encoding='utf-8' ?>" . "\r\n" . "<crosstalkEvents>";
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
		$appid = $row["appid"];
		$sender = $row["sender"];
		$message = $row["message"];
		$output .=  "\r\n" . '<event sender="'. $row["sender"] . '" appID="'. $row["appID"] .'">'. $row["message"] .'</event>';
		$query = "DELETE FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND appid=\"${appid}\" AND message=\"${message}\"";
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
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
    $query = "INSERT INTO `${db_prefix}crosstalk` (userid, message, sender, appID) VALUES('${destination}', '${message}', '${sender}', '${appID}');";
    $link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('Could not select database');
    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
    echo("OK.");
}
}
if (isset($_GET['action'])) {
    if ($_GET['action'] == "getDatabase")
    {
        
    }
    if ($_GET['action'] == "saveDatabase")
    {
        $columns = $_POST['columns'];
        $table = $_POST['table'];
        $name = $_POST['name'];
        $appid = $_POST['appid'];
        $public = $_POST['pub'];
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
 $username = $_SESSION['username'];
echo($username);
}
 if ($_GET['action'] == "getUserID") {
 $userid = $_SESSION['userid'];
 echo($userid);
 }
  if ($_GET['action'] == "getUserLevel") {
  $userlevel = $_SESSION['userlevel'];
  echo($userlevel);
  }
  }
if (isset($_GET['fs'])) {
 if ($_GET['fs'] == "load") {
	// alpha file system file loader - jaymacdonald
	include("config.php");
	$userid = $_SESSION['userid'];
	$path = $_GET['path'];
	$query = "SELECT * FROM ${db_prefix}filesystem WHERE path=\"${path}\"";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$filec = 0;
while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	if($filec != 1) {
	if($row['sharing'] == "all" || $row['userid'] == $userid) {
	$reallocation = $row['location'];
	$file = file_get_contents("../files/$reallocation");
	$file = str_replace("<", "&lt;", $file);
	$file = str_replace(">", "&gt;", $file);
	//echo($file);
	$output = '<?xml version=\'1.0\' encoding=\'utf-8\' ?>' . "\r\n" . '<getFileResponse>';
	$output .=  "\r\n" . '<contents owner="' .$row["userid"]. '" path="' .$path. '" sharing="' .$row['sharing']. '">' . $file . '</contents>';
	$output .=  "\r\n" . '</getFileResponse>';	
	header('Content-type: text/xml');
	echo($output);
	$filec = 1;
	}
	}
	}
	}
	if ($_GET['fs'] == "list") {
	// alpha file system file lister - jaymacdonald
	include("config.php");
	$userid = $_SESSION['userid'];
	$query = "SELECT * FROM ${db_prefix}filesystem";
	$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
	mysql_select_db($db_name) or die('Could not select database');
	$result = mysql_query($query) or die('Query failed: ' . mysql_error());
	$tmp = 0;
	$output = '<?xml version=\'1.0\' encoding=\'utf-8\' ?>' . "\r\n" . '<listFilesResponse>';
	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
	if($row['sharing'] == "all" || $row['userid'] == $userid) {
	$directory = $row['directory'];
	$path = $row['path'];
	$owner = $row['userid'];
	//echo($directory);
	//echo($file);
	$output .=  "\r\n" . '<file owner="' . $owner . '" sharing="' . $row['sharing'] . '">' . $path . '</file>';
	}
	}
	$output .=  "\r\n" . '</listFilesResponse>';
	header('Content-type: text/xml');
	echo $output;
	}
	if ($_GET['fs'] == "save") {
	$uid = $_SESSION['userid'];
	$path = $_GET['path'];
	$contents = $_GET['contents'];
	$location = "../files/$uid1$file";
	file_put_contents($location,$contents);
	require("config.php");
    $link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
    mysql_select_db($db_name) or die('Could not select database');
	$query = "INSERT INTO `${db_prefix}filesystem` (userid, path, location) VALUES('${uid}', '${path}', '${location}');";
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
