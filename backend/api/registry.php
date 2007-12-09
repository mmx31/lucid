<?php
	session_start();
	require("../configuration.php");
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
			if($result != false)
			{
				$result = $result[0];
				echo $result->value;
			}
			else
			{
				if (get_magic_quotes_gpc())
				{
					$_GET['data'] = stripslashes($_GET['data']);
				}
				echo $_GET['data'];
			}
		}
		if($_GET['action'] == "delete")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid", "appid", "name"), array($p->id, $_POST['appid'], $_POST['name']));			
			if(isset($result[0])) { $result[0]->delete(); echo "0"; }
			else { echo "1"; }
		}
	}
	if($_GET['section'] == "info")
	{
		if($_GET['action'] == "exists")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid", "appid", "name"), array($p->id, $_POST['appid'], $_POST['name']));
			if(isset($result[0])) { echo "0"; }
			else { echo "1"; }
		}
	}
?>
