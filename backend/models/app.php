<?php 
	class App extends Base
	{
		var $name = array('type' => "text");
		var $author = array('type' => "text");
		var $email = array('type' => "text");
		var $code = array('type' => "text");
		var $version = array('type' => "text");
		var $maturity = array('type' => "text");
		var $category = array('type' => "text");
	}
	global $App;
	$App = new App();
?>
