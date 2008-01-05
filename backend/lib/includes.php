<?php
	if(!isset($GLOBALS['path'])) {
		$path = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR;
	    $GLOBALS['path'] = $path;
	}
	@include("MDB2.php");
	$includes = array(
		"configuration.php",
		(class_exists(MDB2) ? null : "lib/MDB2.php"),
		"lib/util.php",
		"lib/output.php",
		"models/base.php"
	);
	foreach($includes as $include)
	{
		if(!is_null($include)) require_once($GLOBALS['path'] . $include);
	}
?>
