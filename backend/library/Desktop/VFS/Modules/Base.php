<?php

class Desktop_VFS_Modules_Base {
	var $path;
	var $hostname;
	var $port;
	var $username;
	var $password;
	var $_type = "filesystem"; //possible are 'filesystem' and 'server'. Server will parse the URL for server info.
	var $_startup_on_path_change = false;
	protected function parseUrl($url) {
		$info = array();
		if($this->_type == "filesystem") {
			$p = explode("://", $url, 2);
			$info['path'] = isset($p[1]) ? $p[1] : $url;
			//$this->path = str_replace("..", "", $this->path);
			$path = explode("/", $info['path']);
			$finalPath = array();
			for($i=0;$i<count($path);$i++) {
				if($path[$i] == "..")
					array_pop($finalPath);
				else if($path[$i] == ".")
					continue;
				else
					$finalPath[] = $path[i];
			}
			$info['path'] = $finalPath;			
		}
		else if($this->_type == "server") {
			//parse the URL for server connection details
			$url = explode("://", $url, 2);
			$url = $url[1];
			$path = explode("/", $url, 2);
			$info['path'] = $path[1];
			$args = explode("@", $path[0], 2);
			if(isset($args[1])){
				$serverInfo = $args[1];
				$userInfo = $args[0];
				$userInfo = explode(':', $userInfo, 2);
				$info['username'] = $userInfo[0];
				if(isset($userInfo[1])) $info['password'] = $userInfo[1];
			}
			else $serverInfo = $args[0];
			$serverInfo = explode(':', $serverInfo, 2);
			$info['hostname'] = $serverInfo[0];
			if(isset($serverInfo[1])) $info['port'] = $serverInfo[1];
		}
		foreach($info as $key=>$val) {
			if($this->$key != $val && ($key != 'path' && !$this->_startup_on_path_change)) {
				foreach($info as $key=>$val) {
					$this->$key = $val;
				}
				$this->startup();
				break;
			}
			else if($key == 'path' && !$this->_startup_on_path_change) {
				$this->path = $info['path'];
			}
		}
		return $info;		
	}
	protected function _startup() {
		//connect to server, etc.
	}
	public function fopen($filename, $mode) {
		throw new Desktop_VFS_UnimplementedException("fopen is not implemented in this backend");
	}
	public function fclose($filepointer) {
		throw new Desktop_VFS_UnimplementedException("fclose is not implemented in this backend");
	}
	public function fread($filepointer, $length) {
		throw new Desktop_VFS_UnimplementedException("fread is not implemented in this backend");
	}
	public function fwrite($filepointer, $string, $length) {
		throw new Desktop_VFS_UnimplementedException("fwrite is not implemented in this backend");
	}
	public function ftruncate($filepointer, $length) {
		throw new Desktop_VFS_UnimplementedException("ftruncate is not implemented in this backend");
	}
	public function fflush($filepointer) {
		throw new Desktop_VFS_UnimplementedException("fflush is not implemented in this backend");
	}
	public function feof($filepointer) {
		throw new Desktop_VFS_UnimplementedException("feof is not implemented in this backend");
	}
	public function fstat($filepointer) {
		throw new Desktop_VFS_UnimplementedException("fstat is not implemented in this backend");
	}
	public function fseek($filepointer, $offset, $whence) {
		throw new Desktop_VFS_UnimplementedException("fseek is not implemented in this backend");
	}
	public function ftell($filepointer) {
		throw new Desktop_VFS_UnimplementedException("ftell is not implemented in this backend");
	}
	public function rewind($filepointer) {
		throw new Desktop_VFS_UnimplementedException("rewind is not implemented in this backend");
	}
	public function unlink($filename) {
		throw new Desktop_VFS_UnimplementedException("unlink is not implemented in this backend");
	}
	public function stat($filename) {
		$fp = $this->fopen($filename, "rb");
		$stat = $this->fstat($fp);
		$this->fclose($fp);
		return $stat;
	}
	public function space() {
		throw new Desktop_VFS_UnimplementedException("space is not implemented in this backend");
	}
}
