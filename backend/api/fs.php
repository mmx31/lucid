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
session_start();
if($_GET['section'] == "io")
{
	$_POST['path'] = str_replace("..", "", $_POST['path']); // fix to stop hacking.
	require("../lib/includes.php");
	import("models.user");
	$user = $User->get_current();
	$protocolPart = explode("://", $_POST["path"]);
	if($protocolPart[0] == $_POST['path']) { $protocol = "file"; }
	else { $_POST["path"] = "/".$protocolPart[1]; $protocol = $protocolPart[0]; }
	import("api.vfsProtocols.$protocol");
	handleRequest($_GET, $_POST, $user);
}
?>
