<?php

class Desktop_User {
	private static $_currentUser;
	public function set($username) {
		if(is_null(self::$_currentUser) && is_string($username))
			self::$_currentUser = $username;
		else
			throw Exception("Attempted to set current username twice");
	}
	public function get() {
		return self::$_currentUser;
	}
}
