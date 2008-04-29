<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.crosstalk");
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
					sender => $row->sender,
					appid => $row->appid,
					instance => $row->instance,
					args => $row->args,
					topic => $row->topic
				));
				$row->delete();
			}
			$out = new jsonOutput($array);
		}
	    if ($_GET['action'] == "sendEvent")
	    {
			$p = new $Crosstalk();
			foreach(array("args", "userid", "appid", "instance", "topic") as $item) {
				$p->$item = $_POST[$item];
			}
			$p->sender = $_SESSION['userid'];
			if($p->userid == 0) {
				$p->userid = $p->sender;
			}
			$p->save();
		    $out = new intOutput("ok");
		}
	}
?>