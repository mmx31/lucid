<?php 
	class Config extends Base
	{
		var $userid = array('dbtype' => 'int', 'length' => 11);
		var $value = array('dbtype' => 'mediumtext');
	}
	$Config = new Config();
?>