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
import("models.config");
import("models.user");
if($_GET['section'] == "stream")
{
	if($_GET['action'] == "save")
	{
		$p = $User->get_current();
		if($p==false) die();
		$result = $Config->filter("userid", $p->id);
		if($result == false) { $u = new $Config(array(userid => $p->id)); }
		else { $u = $result[0]; }
		$u->value = $_POST['value'];
		$u->save();
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
?>
