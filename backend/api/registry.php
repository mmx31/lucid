<?php
	require("../models/registry.php");
    if($_GET['section'] == "stream")
	{
		if($_GET['action'] == "save")
		{
			$p = $User->get_current();
			$result = $Registry->filter("userid", $p->id); //TODO: here's where we need to be able to chain filters somehow.
			if(!isset($result[0])) { $u = new $Registry(); $u->userid = $p->id; }
			else { $u = $result[0]; }
			$u->value = stripslashes($_POST['value']);
			$u->save();
			echo "0";
		}
		if($_GET['action'] == "load")
		{
			$p = $User->get_current();
			$result = $Config->filter("userid", $p->id); //TODO: here's where we need to be able to chain filters somehow.
			$result = $result[0];
			echo $result->value;
		}
	}
?>
