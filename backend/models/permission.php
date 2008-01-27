<?php
	class Permission extends Base {
		var $name = array('type' => "text");
		var $description = array('type' => "text");
		var $initial = array('type' => "boolean", "default" => true);
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