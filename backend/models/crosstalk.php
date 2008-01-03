<?php 
	class Crosstalk extends Base
	{
		var $sender = array('dbtype' => 'mediumtext');
		var $userid = array('dbtype' => 'int', 'length' => 11);
		var $appID = array('dbtype' => 'int', 'length' => 11);
		var $message = array('dbtype' => 'mediumtext');
		var $instance = array('dbtype' => 'int', 'length' => 11);
		var $_tablename = "crosstalk";
	}
	$Crosstalk = new Crosstalk();
?>
