<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Group extends Base
	{
		var $name = array('type' => "text");
		var $description = array('type' => "text");
		var $permissions = array('type' => "array");
		var $quota = array('type' => 'integer', 'default' => -1);
		
		function clear_permission($perm) {
			unset($this->permissions[$perm]);
		}
		function remove_permission($perm) {
			$this->permissions[$perm] = false;
		}
		function has_permission($perm) {
			return $this->permissions[$perm];
		}
		function add_permission($perm) {
			$this->permissions[$perm] = true;
		}
		function cleanup() {
			$p = $User->all();
			foreach($p as $user) {
				foreach($user->groups as $key => $val) {
					if($val == $this->name) array_splice($user->groups, $key, 1);
				}
			}
		}
	}
	global $Group;
	$Group = new Group();