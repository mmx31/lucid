<?php
	if(!isset($GLOBALS['path'])) {
		$p = substr(__FILE__, strrpos(__FILE__,"backend"));
		$ml = explode(DIRECTORY_SEPARATOR, $p);
	
		$path = "./";
		$l = count((isset($ml[0]) ? $ml : $w));
		for($i=0; $i < $l-2; $i++)
		{
			$path .= "../";
		}
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
