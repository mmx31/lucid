<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
require("../lib/includes.php");
import("models.app");
import("models.user");
import("models.permission");
if(!$Permission->exists("api.ide")) {
	$p = new $Permission(array(
		'name' => 'api.ide',
		'dispName' => 'Can develop applications'
	));
	$p->save();
}
$user = $User->get_current();
if(!$user->has_permission("api.ide")) internal_error("permission_denied");
if($_GET['section'] == "io")
{
	if($_GET['action'] == "save")
	{
		if($_POST['id'] == -1) { $app = new App(); }
		else { $app = $App->get($_POST['id']); }
		foreach(array('name', 'author', 'email', 'code', 'version', 'maturity', 'category') as $item) {
			$app->$item = $_POST[$item];
		}
		$app->save();
		$out = new jsonOutput();
		$out->append("id", $app->id);
	}
}
?>

