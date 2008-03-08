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
	class Permission extends Base {
		var $name = array('type' => "text");
		var $description = array('type' => "text");
		var $initial = array('type' => "boolean", "default" => true);
		var $staticPer = array('type' => "boolean", "default" => true);
		var $interval = array('type' => "integer", "default" => 0);
		function cleanup() {
			import("models.user");
			$users = $User->all();
			foreach($users as $user) {
				$user->remove_permission($this->name);
			}
		}
		function exists($perm) {
			$p = $this->filter("name", $perm);
			return isset($p[0]);
		}
	}
	global $Permission;
	$Permission = new Permission();
?>
