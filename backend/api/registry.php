<?php
	session_start();
	require("../models/registry.php");
	require("../models/user.php");
    if($_GET['section'] == "stream")
	{
		if($_GET['action'] == "save")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid", "appid", "name"), array($p->id, $_POST['appid'], $_POST['name']));
			if(!isset($result[0])) { $u = new $Registry(); $u->userid = $p->id; $u->name=$_POST['name']; $u->appid = $_POST['appid']; }
			else { $u = $result[0]; }
			$u->value = stripslashes($_POST['value']);
			$u->save();
			echo "0";
		}
		if($_GET['action'] == "load")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid", "appid", "name"), array($p->id, $_GET['appid'], $_GET['name']));
			if(isset($result[0]))
			{
				$result = $result[0];
				echo $result->value;
			}
			else
			{
				echo "{\"identifier\":true,\"items\":[]}";
			}
		}
	}
?>
