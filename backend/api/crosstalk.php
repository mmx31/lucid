<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/

	require("../lib/includes.php");
	//check loads, crosstalk can be hefty on the server
	if(function_exists('sys_getloadavg') && $GLOBALS['conf']['crosstalkThrottle']) { //We have a UNIX system! Yay!
		$load = sys_getloadavg();
		if ($load[0] > 75) {
		    header('HTTP/1.1 503 Too busy, try again later');
		    die('Server too busy. Please try again later.');
		}
	}
	else {	//We have a windows user :(
		//die('you windows n00b');
	}
	import("models.crosstalk");
	import("models.user");
	if($_GET['section'] == "io")
	{
		if ($_GET['action'] == "checkForEvents")
	    {
			$result_user = $Crosstalk->filter("userid", $_SESSION['userid']);
			$result_public = $Crosstalk->filter("userid", -1);
			if($result_user == false) $result_user = array();
			if($result_public == false) $result_public = array();
			$result = array_merge($result_user, $result_public);
			$array = array();
			foreach($result as $row) {
				array_push($array, array(
					"sender" => $row->sender,
					"appsysname" => $row->appsysname,
					"instance" => $row->instance,
					"args" => $row->args,
					"topic" => $row->topic
				));
				$row->delete();
			}
			$out = new jsonOutput($array);
		}
		if($_GET['action'] == "cancelEvent")
	     {
			$event = $Crosstalk->get($_POST['id']);
			$cur = $User->get_current();
			if(!$event)
				$out = intOutput("ok");
			else if($event->sender == $_SESSION['userid'] || $cur->has_permission("core.administration")) {
				$event->delete();
				$out = intOutput("ok");
			}
			else
				$out = intOutput("permission_denied");
	}
	    if ($_GET['action'] == "eventExists")
	    {
		$array = array();
		$event = $Crosstalk->get($_POST['id']);
		if(!$event) $array['exists'] = false;
		else $array['exists'] = true;
		$out = new jsonOutput($array);
	    }
	    if ($_GET['action'] == "sendEvent")
	    {
			$cur = $User->get_current();
			if($_POST['appsysname'] == -1 && $cur->has_permission("core.administration") == false) //NOTE: Only admins should send system events; remove in future if changes
					$out = intOutput("permission_denied");
			else {
				$p = new $Crosstalk();
				foreach(array("args", "userid", "appsysname", "instance", "topic") as $item) {
					$p->$item = $_POST[$item];
				}
				$p->sender = $_SESSION['userid'];
				if($p->userid == 0) {
					$p->userid = $p->sender;
				}
				$p->save();
			        echo($p->id);
			}
		}
	}
?>
