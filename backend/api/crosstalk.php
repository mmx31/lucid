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
	    if ($_GET['action'] == "removeEvent")
		{
		   	$p = $Crosstalk->filter(Array("userid", "id"), Array($_SESSION['userid'], $_POST['id']));
			$p[0]->delete();
			$out = new intOutput("ok");
		}
		if ($_GET['action'] == "checkForEvents")
	    {
		    header('Content-type: text/xml');
			$result = $Crosstalk->filter("userid", $_SESSION['userid']);
			$output = "<" . "?xml version='1.0' encoding='utf-8' ?" . ">\r\n" . "<crosstalkEvents>";
			if($result != false)
			{
				foreach($result as $row) {
					$output .=  "\r\n" . '<event id="'. $row->id .'" sender="'. $row->sender . '" appid="'. $row->appid .'" instance="'. $row->instance .'">'. $row->message .'</event>';
				}
			}		
			$output .=  "\r\n" . "</crosstalkEvents>";	
			echo $output;
		}
	    if ($_GET['action'] == "SendEvent")
	    {
				$p = new $Crosstalk();
				foreach(array("message", "destination", "appid", "instance") as $item) {
					$p->$item = $_POST[$item];
				}
				$p->sender = $_SESSION['userid'];
				if($p->destination == 0) {
				$p->destination = $p->sender;
				$p->save();
			}
		    $out = new intOutput("ok");
		}
	}
?>