<?php
	class Group extends Base
	{
		var $name = array('type' => "text");
		var $description = array('type' => "text");
		var $permissions = array('type' => 'array');
		
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
	}
	global $Group;
	$Group = new Group();
?>