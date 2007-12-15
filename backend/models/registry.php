<?php 
	class Registry extends Base
	{
		var $userid = array('type' => 'int', 'length' => 11);
		var $appid = array('type' => 'int', 'length' => 11);
		var $name = array('type' => 'mediumtext');
		var $value = array('type' => 'longtext');
	}
	$Registry = new Registry();
?>