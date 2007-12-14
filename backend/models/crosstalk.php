<?php 
	if(!$Base) require("base.php");
	class Crosstalk extends Base
	{
		var $id;
		var $sender;
		var $appID;
		var $message;
		var $instance;
		var $_tablename = "crosstalk";
	}
	$Crosstalk = new Crosstalk();
?>
