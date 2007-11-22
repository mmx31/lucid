<?php 
	if(!$Base) require("base.php");
	class App extends Base
	{
		var $name = "";
		var $author = "";
		var $email = "";
		var $code = "";
		var $version = "";
		var $maturity = "";
		var $category = "";
		var $_tablename = "apps";
	}
	$App = new App();
?>
