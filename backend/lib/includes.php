<?php
	$p = substr(__FILE__, strrpos(__FILE__,"backend"));
	$ml = explode("/", $p);
	$w = explode("\\", $p);
	$path = "./";
	$l = count((isset($ml[0]) ? $ml : $w));
	for($i=0; $i < $l-2; $i++)
	{
		$path .= "../";
	}
	foreach(array(
		"configuration.php",
		//"lib/PEAR.php", //uncomment if you don't have PEAR installed
		"lib/MDB2.php",
		"lib/util.php",
		"lib/output.php",
		"models/base.php"
	) as $include)
	{
		require_once($path . $include);
	}
?>