<?php 
	if(!$Base) require("base.php");
	class App extends Base
	{
		var $id;
		var $name;
		var $author;
		var $email;
		var $code;
		var $version;
		var $maturity;
		var $category;
		var $_tablename = "apps";
		function make_json()
		{
			$p = "{";
			$length = $this->count()-1;
			$i=0;
			foreach($this as $key => $value)
			{
				if($key != "_tablename")
				{
					$value = str_replace("\r\n", "\\r\\n", $value);
					$value = str_replace("\r", "\\r", $value);
					$value = str_replace("\n", "\\n", $value);
					$p .= "\"". addslashes($key) . "\":\"" . addslashes(addslashes($value)) . "\"";
					if($i != $length)
					{
						$p .= ",";
					}
				}
				$i++;
			}
			$p .= "}";
			return $p;
		}
	}
	$App = new App();
?>