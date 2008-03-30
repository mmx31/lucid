<?php
import("api.vfs.File");
class PublicFs extends FileFs {
	function _startup() {}
	function _basePath() {
		return "../../public/";
	}
}
?>