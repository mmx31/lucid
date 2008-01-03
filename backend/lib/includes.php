<?php
	$p = substr(__FILE__, strrpos(__FILE__,"backend"));
	$ml = explode(DIRECTORY_SEPARATOR, $p);

	$path = "./";
	$l = count((isset($ml[0]) ? $ml : $w));
	for($i=0; $i < $l-2; $i++)
	{
		$path .= "../";
	}
	foreach(array(
		"configuration.php",
		"lib/MDB2.php",
		"lib/util.php",
		"lib/output.php",
		"models/base.php"
	) as $include)
	{
		if(!is_null($include)) require_once($path . $include);
	}
?>