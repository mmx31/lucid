<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


require("../lib/includes.php");
import("models.config");
import("models.user");
if($_GET['section'] == "stream")
{
	if($_GET['action'] == "save")
	{
		$p = $User->get_current();
		if($p==false) internal_error("generic_err", "user not logged in");
		$result = $Config->filter("userid", $p->id);
		if($result == false) { $u = new $Config(array(userid => $p->id)); }
		else { $u = $result[0]; }
		$u->value = $_POST['value'];
		$u->save();
		if($_POST['logged'] == true) {
			$p->logged = true;
			$p->save();
		}
		$out = new intOutput();
		$out->set("ok");
	}
	if($_GET['action'] == "load")
	{
		$p = $User->get_current();
		$result = $Config->filter("userid", $p->id);
		if($result == false) {
			echo "{}";
		}
		else {
			$result = $result[0];
			echo $result->value;	
		}
	}
}
