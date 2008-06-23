<?php

class Desktop_VFS {
	private function getModule($url) {
		$parts = explode("://", $url, 2);
		$module = "Desktop_VFS_Modules_".$parts[0];
		Zend_Loader::loadClass($module);
		return $module;
	}
	public function copy($source, $destination) {
		$module = self::getModule($source);
		
	}
}
