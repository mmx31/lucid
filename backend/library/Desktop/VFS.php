<?php

class Desktop_VFS {
	private function getModule($url) {
		$parts = explode("://", $url, 2);
		$module = "Desktop_VFS_Modules_".$parts[0];
		Zend_Loader::loadClass($module);
		return $module;
	}
	public function copy($source, $destination) {
		$smodule = self::getModule($source);
		$dmodule = self::getModule($destination);
		$smodule = new $smodule;
		$dmodule = new $dmodule;
		$sFile = $smodule->fopen($source, "r");
		$dFile = $dmodule->fopen($source, "w");
		while(!$smodule->feof($sFile)) {
			$c = $smodule->fread($sFile);
			$dmodule->fwrite($c);
		}
		$smodule->fclose($sFile);
		$dmodule->fclose($dFile);
	}
}
