<?php 
	class Config extends Base
	{
		var $userid = array('type' => 'integer', 'length' => 11);
		var $value = array('type' => 'text');
	}
	global $Config;
	$Config = new Config();
?>