<?php 
	class Registry extends Base
	{
		var $userid = array('dbtype' => 'int', 'length' => 11);
		var $appid = array('dbtype' => 'int', 'length' => 11);
		var $name = array('dbtype' => 'mediumtext');
		var $value = array('dbtype' => 'longtext');
	}
	$Registry = new Registry();
?>