<?php

class Desktop_VFS_Modules_File extends Desktop_VFS_Modules_Base {
	protected function getRealPath($path) {
		//TODO: insert the username when that section is finished
		$installPath = dirname(dirname(dirname(dirname(dirname(dirname(__FILE__))))));
		$user = "a";
		$path = explode("://", 2);
		return $installPath."/files/".$user."/".$path[1];
	}
	public function fopen($filename, $mode) {
		return array(
			'pointer' => fopen(self::getRealPath($filename), $mode),
			'path' => self::getRealPath($filename)
		);
	}
	public function fclose($filepointer) {
		return fclose($filepointer['pointer']);
	}
	public function fread($filepointer, $length=null) {
		if(!is_null($length)) return fread($filepointer['pointer'], $length);
		else return fread($filepointer['pointer']);
	}
	public function fwrite($filepointer, $string, $length=null) {
		if(!is_null($length)) return fwrite($filepointer['pointer'], $string, $length);
		else return fread($filepointer['pointer'], $string);
	}
	public function ftruncate($filepointer, $length) {
		return ftruncate($filepointer['pointer'], $length);
	}
	public function fflush($filepointer) {
		return fflush($filepointer['pointer']);
	}
	public function feof($filepointer) {
		return feof($filepointer['pointer']);
	}
	public function fstat($filepointer) {
		return array(
			'name' => basename($filepointer['path']),
			'size' => filesize($filepointer['path']),
			'type' => Desktop_VFS_Mimetype::get($filepointer['path']),
			'modified' => filemtime($filepointer['path'])
		);
	}
	public function fseek($filepointer, $offset, $whence=null) {
		if(!is_null($whence)) return fseek($filepointer['pointer'], $offset, $whence);
		else return fseek($filepointer['pointer'], $offset);
	}
	public function ftell($filepointer) {
		return ftell($filepointer['pointer']);
	}
	public function rewind($filepointer) {
		return rewind($filepointer['pointer']);
	}
	public function unlink($filename) {
		return unlink(self::getRealPath($filename));
	}
	public function space() {
		//TODO: implement this when user stuff has been rewritten
	}
}
