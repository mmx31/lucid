<?php
session_start();
require("../configuration.php");
require("../models/base.php");
require("../models/config.php");
require("../models/user.php");
if($_GET['section'] == "stream")
{
	if($_GET['action'] == "save")
	{
		$p = $User->get_current();
		$result = $Config->filter("userid", $p->id);
		if(!isset($result[0])) { $u = new $Config(); $u->userid = $p->id; }
		else { $u = $result[0]; }
		$u->value = stripslashes($_POST['value']);
		$u->save();
		echo "0";
	}
	if($_GET['action'] == "load")
	{
		$p = $User->get_current();
		$result = $Config->filter("userid", $p->id);
		$result = $result[0];
		echo $result->value;
	}
}
?>
