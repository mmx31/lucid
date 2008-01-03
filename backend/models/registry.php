<?php 
	class Registry extends Base
	{
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appid = array('type' => 'integer', 'length' => 11);
		var $name = array('type' => 'text');
		var $value = array('type' => 'text');
	}
	$Registry = new Registry();
?>