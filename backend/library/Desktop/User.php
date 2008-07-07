<?php

class Desktop_User {
	private static $_currentUser;
	public function setUser($username) {
		if(is_null(self::$_currentUser) && is_string($username))
			self::$_currentUser = $username;
		else
			throw Exception("Attempted to set current username twice");
	}
	public function getUser() {
		return self::$_currentUser;
	}
}
