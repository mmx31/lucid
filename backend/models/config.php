<?php 
	class Config extends Base
	{
		var $userid = array('type' => 'int', 'length' => 11);
		var $value = array('type' => 'mediumtext');
	}
	$Config = new Config();
?>