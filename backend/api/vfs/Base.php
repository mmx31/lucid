<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/

import("lib.json.Json");
import("models.auth");
import("lib.Blowfish");
import("models.user");
define('CRYPT_BLOWFISH_NOMCRYPT', true);

class BaseFs {
	var $path;
	var $hostname;
	var $port;
	var $username;
	var $password;
	var $_type = "filesystem"; //possible are 'filesystem' and 'server'. Server will parse the URL for server info.
	function __construct($url) {
		global $Auth;
		global $User;
		
		if($this->_type == "filesystem") {
			$p = explode("://", $url, 2);
			$this->path = isset($p[1]) ? $p[1] : $url;
			$this->path = str_replace("..", "", $this->path);
		}
		else if($this->_type == "server") {
			$user = $User->get_current();
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
			}
			else $serverInfo = $args[0];
			$serverInfo = explode(":", $serverInfo, 2);
			$this->hostname = $serverInfo[0];
			if(isset($serverInfo[1])) $this->port = $serverInfo[1];
			
			//deffer password lookups until after we have everything else
			
			if($userInfo[1]) $this->password = $userInfo[1];
			else {
				$entries = $Auth->filter(array(
					appid => 0, //$info["appid"],
					server => get_class($this) . "://" . $this->hostname . ":" . $this->port,
					username => $this->username,
					userid => $user->id
				));
				if(isset($entries[0])) {
					$blowfish = Crypt_Blowfish::factory("ecb");
					$blowfish->setKey($GLOBALS['conf']['salt']);
					$this->password = trim($blowfish->decrypt($entries[0]->password));
				}
			}
			
			if($_POST['login'] && $_POST['login'] != "undefined") {
				$info = Zend_Json::decode($_POST['login']);
				$this->password = $info['password'];
				if($info["remember"] == "forever") {
					//remember the password
					$entries = $Auth->filter(array(
						appid => 0, //$info["appid"],
						server => get_class($this) . "://" . $this->hostname . ":" . $this->port,
						username => $this->username,
						userid => $user->id
					));
					//get encryption stuff going
					$blowfish = Crypt_Blowfish::factory("ecb");
					$blowfish->setKey($GLOBALS['conf']['salt']);
					
					if(!$entries[0])
					{
						//create
						$entry = new $Auth(array(
							appid => 0, //$info["appid"],
							server => get_class($this) . "://" . $this->hostname . ":" . $this->port,
							username => $this->username,
							userid => $user->id,
							password => $blowfish->encrypt($info["password"]),
						));
					}
					else {
						//update
						$entry = $entries[0];
						$entry->password = $blowfish->encrypt($info["password"]);
					}
					$entry->save();
				}
			}
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
		return str_replace("..", "", $file);
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
	function quota($remaining="quota") {
		return $this->_quota($remaining);
	}
	function _quota($remaining) {
		return 0;
	}
	function write($path, $content) {
		$path = $this->_getPath($path);
		return $this->_write($path, $content);
	}
	function _write($path, $content) {
		return true;
	}
}