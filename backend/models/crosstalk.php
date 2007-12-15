<?php 
	if(!$Base) require("base.php");
	class Crosstalk extends Base
	{
		var $sender = array('type' => 'mediumtext');
		var $userid = array('type' => 'int', 'length' => 11);
		var $appID = array('type' => 'int', 'length' => 11);
		var $message = array('type' => 'mediumtext');
		var $instance = array('type' => 'int', 'length' => 11);
		var $_tablename = "crosstalk";
	}
	$Crosstalk = new Crosstalk();
?>
