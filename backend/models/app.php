<?php 
	class App extends Base
	{
		var $name = array('type' => "mediumtext");
		var $author = array('type' => "mediumtext");
		var $email = array('type' => "mediumtext");
		var $code = array('type' => "longtext");
		var $version = array('type' => "mediumtext");
		var $maturity = array('type' => "mediumtext");
		var $category = array('type' => "mediumtext");
		var $_tablename = "apps";
	}
	$App = new App();
?>
