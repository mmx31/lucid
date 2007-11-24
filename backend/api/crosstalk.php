<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
	session_start();
	require("config.php");
	$userid = $_SESSION['userid'];
	if($_POST['section'] == "io")
	{
	    if ($_POST['action'] == "removeEvent")
		   {
			$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$id = $_POST['id'];
			$query = "DELETE FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND ID=\"${id}\"";
		    $result = mysql_query($query) or die('Query failed: ' . mysql_error());
			echo("OK.");
		}
		if ($_POST['action'] == "checkForEvents")
	    {
		    header('Content-type: text/xml');
			$query = "SELECT * FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\"";
			$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$output = "<" . "?xml version='1.0' encoding='utf-8' ?" . ">\r\n" . "<crosstalkEvents>";
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
				while ($row = @mysql_fetch_array($result, MYSQL_ASSOC)) {
				//if($row["instance"] == $null || $row["instance"] == $instance || $row["instance"] == 0) {
				$appid = $row["appID"];
				$sender = $row["sender"];
				$message = $row["message"];
				$output .=  "\r\n" . '<event id="'. $row["ID"] .'" sender="'. $row["sender"] . '" appid="'. $row["appID"] .'" instance="'. $row["instance"] .'">'. $row["message"] .'</event>';
				//$query = "DELETE FROM ${db_prefix}crosstalk WHERE userid=\"${userid}\" AND appID=\"${appid}\" AND message=\"${message}\"";
				//mysql_query($query) or die('Query failed: ' . mysql_error());
				//}
				}		
			$output .=  "\r\n" . "</crosstalkEvents>";	
			echo($output);
		}
	    if ($_POST['action'] == "SendEvent")
	    {
			    $message = $_POST["message"];
			    $sender = $userid;
			    $destination = $_POST["userid"];
			    $appID = $_POST["appid"];
				$instance = $_POST["instance"];
				if($destination == 0) {
				$destination = $sender;
			}
			if($instance != $null) {
				$query = "INSERT INTO `${db_prefix}crosstalk` (userid, message, sender, appID, instance) VALUES('${destination}', '${message}', '${sender}', '${appID}', '${instance}');";
		    }
			else {
				$query = "INSERT INTO `${db_prefix}crosstalk` (userid, message, sender, appID) VALUES('${destination}', '${message}', '${sender}', '${appID}');";
		    }
			$link = mysql_connect($db_host, $db_username, $db_password) or die('Could not connect: ' . mysql_error());
		    mysql_select_db($db_name) or die('Could not select database');
		    mysql_query($query) or die('Query failed: ' . mysql_error());
		    echo("OK. appID=$appID");
		}
	}
?>