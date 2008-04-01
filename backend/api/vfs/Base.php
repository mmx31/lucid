<?php

class BaseFs {
	var $path;
	var $hostname;
	var $port;
	var $username;
	var $password;
	var $_type = "filesystem"; //possible are 'filesystem' and 'server'. Server will parse the URL for server info.
	function __construct($url) {
		if($this->_type == "filesystem") {
			$this->path = $url;
		}
		else if($this->_type == "server") {
			//parse the URL for server connection details
			$url = explode("://", $url, 2);
			$url = $url[1];
			$path = explode("/", $url, 2);
			$this->path = $path[1];
			$args = explode("@", $path[0], 2);
			if(isset($args[1])){
				$serverInfo = $args[1];
				$userInfo = $args[0];
				$userInfo = explode(":", $userInfo, 2);
				$this->username = $userInfo[0];
				if(isset($userInfo[1])) $this->password = $userInfo[1];
			}
			else $serverInfo = $args[0];
			$serverInfo = explode(":", $serverInfo, 2);
			$this->hostname = $serverInfo[0];
			if(isset($serverInfo[1])) $this->port = $serverInfo[1];
		}
		$this->_startup();
	}
	function _startup() {
		//connect to server, etc.
	}
	function _getPath($file) {
		$t = explode("/", $file);
		if(!isset($t[1])) $file = $this->path . "/" . $file;
		else {
			$t = explode("./", $file, 1);
			if(isset($t[1])) $file = $this->path . "/" . $t[1];
		}
		return $file;
	}
	function getRealPath($path) {
		$path = $this->_getPath($path);
		return $this->_getRealPath($path);
	}
	function _getRealPath($path) {
		return $path;
	}
	function listPath($path=false) {
		if($path == false) $path = $this->path;
		return $this->_listPath($path);
	}
	function _listPath($path) {
		return array();
	}
	function getFileInfo($file) {
		$file = $this->_getPath($file);
		return $this->_getFileInfo($file);
	}
	function _getFileInfo($path) {
		return array(
			name => "",
			extension => ".*",
			type => "",
			path => $path,
			size => 0,
			modified => "never",
			accessed => "never"
		);
	}
	function remove($path) {
		$path = $this->_getPath($path);
		return $this->_remove($path);
	}
	function _remove($path) {
		return true;
	}
	function createDirectory($path) {
		$path = $this->_getPath($path);
		return $this->_createDirectory($path);
	}
	function _createDirectory($path) {
		return true;
	}
	function copy($source, $destination) {
		$source = $this->_getPath($source);
		$destination = $this->_getPath($destination);
		return $this->_copy($source, $destination);
	}
	function _copy($source, $destination) {
		return true;
	}
	function rename($oldpath, $newpath) {
		$oldpath = $this->_getPath($oldpath);
		$newpath = $this->_getPath($newpath);
		return $this->_rename($oldpath, $newpath);
	}
	function _rename($source, $destination) {
		return true;
	}
	function read($path) {
		$path = $this->_getPath($path);
		return $this->_read($path);
	}
	function _read($path) {
		return "";
	}
	function write($path, $content) {
		$path = $this->_getPath($path);
		return $this->_write($path, $content);
	}
	function _write($path, $content) {
		return true;
	}
}

?>
