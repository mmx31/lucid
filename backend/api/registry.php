<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.registry");
	import("models.user");
    if($_GET['section'] == "stream")
	{
		if($_GET['action'] == "save")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appname" => $_POST['appname'], "name" => $_POST['name']));
			if(!isset($result[0])) { $u = new $Registry(); $u->userid = $p->id; $u->name=$_POST['name']; $u->appname = $_POST['appname']; }
			else { $u = $result[0]; }
			$u->value = $_POST['value'];
			$u->save();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "load")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appname" => $_POST['appname'], "name" => $_POST['name']));
			if($result != false)
			{
				$result = $result[0];
				echo $result->value;
			}
		}
		if($_GET['action'] == "delete")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appname" => $_POST['appname'], "name" => $_POST['name']));			
			if(isset($result[0])) { $result[0]->delete(); $out = new jsonOutput(array("exists"=>true)); }
			else { $out = new jsonOutput(array("exists"=>false)); }
		}
	}
	if($_GET['section'] == "info")
	{
		if($_GET['action'] == "exists")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appname" => $_POST['appname'], "name" => $_POST['name']));
			$out = new jsonOutput(array("exists"=>($result != false)));
		}
	}
?>
