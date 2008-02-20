<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychcf

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
	require("../lib/includes.php");
	import("models.registry");
	import("models.user");
    if($_GET['section'] == "stream")
	{
		if($_GET['action'] == "save")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appid" => $_POST['appid'], "name" => $_POST['name']));
			if(!isset($result[0])) { $u = new $Registry(); $u->userid = $p->id; $u->name=$_POST['name']; $u->appid = $_POST['appid']; }
			else { $u = $result[0]; }
			$u->value = $_POST['value'];
			$u->save();
			$out = new intOutput("ok");
		}
		if($_GET['action'] == "load")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appid" => $_GET['appid'], "name" => $_GET['name']));
			if($result != false)
			{
				$result = $result[0];
				echo $result->value;
			}
			else
			{
				echo $_GET['data'];
			}
		}
		if($_GET['action'] == "delete")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appid" => $_POST['appid'], "name" => $_POST['name']));			
			if(isset($result[0])) { $result[0]->delete(); $out = new intOutput("ok"); }
			else { $out = new intOutput("generic_err"); }
		}
	}
	if($_GET['section'] == "info")
	{
		if($_GET['action'] == "exists")
		{
			$p = $User->get_current();
			$result = $Registry->filter(array("userid" => $p->id, "appid" => $_POST['appid'], "name" => $_POST['name']));
			if(isset($result[0])) { $out = new intOutput("ok"); }
			else { $out = new intOutput("generic_err"); }
		}
	}
?>
