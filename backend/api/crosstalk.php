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