<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Permission extends Base {
		var $name = array('type' => "text");
		var $description = array('type' => "text");
		var $initial = array('type' => "boolean", "default" => true);
		var $staticper = array('type' => "boolean", "default" => true);
		var $timeout = array('type' => 'integer', 'length' => 2, 'default' => 0);

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
