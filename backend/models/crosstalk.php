<?php 
	class Crosstalk extends Base
	{
		var $sender = array('type' => 'text');
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appID = array('type' => 'integer', 'length' => 11);
		var $message = array('type' => 'text');
		var $instance = array('type' => 'integer', 'length' => 11);
	}
	global $Crosstalk;
	$Crosstalk = new Crosstalk();
?>
