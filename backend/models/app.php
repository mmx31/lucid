<?php 
	class App extends Base
	{
		var $name = array('dbtype' => "mediumtext");
		var $author = array('dbtype' => "mediumtext");
		var $email = array('dbtype' => "mediumtext");
		var $code = array('dbtype' => "longtext");
		var $version = array('dbtype' => "mediumtext");
		var $maturity = array('dbtype' => "mediumtext");
		var $category = array('dbtype' => "mediumtext");
		var $_tablename = "apps";
	}
	$App = new App();
?>
