<?php
class objOutput {
	var $output = Array();
	function __deconstruct() {
		print_r($output);
	}
	function append($name, $item)
	{
		$this->output->$name = $item;
	}
	function set($arr)
	{
		$this->output = $arr;
	}
}
class intOutput {
	var $output = 0;
	var $types = Array(
		"ok" => 0,
		"generic_err" => 1,
		"not_authed" => 2,
		"not_found" => 3,
		"db_connect_err" => 4,
		"db_select_err" => 5,
		"db_query_err" => 6
	);	
	function __deconstruct() {
		echo $output;
		if($php_errormsg)
		{
			echo "\n" . $php_errormsg;
		}
	}
	function set($val, $die=false)
	{
		if(is_string($val))
		{
			$val = $this->types[$val];
		}
		$this->output = $val;
		if($die) die();
	}
}

class jsonOutput extends objOutput {
	function __deconstruct() {
		if($php_errormsg)
		{
			$this->append("sqlerror", $php_errormsg);
		}
		echo json_encode($this->output);
	}
}

class textareaOutput extends jsonOutput {
	function __deconstruct() {
		if($php_errormsg)
		{
			$this->append("sqlerror", $php_errormsg);
		}
		echo "<textarea>" . json_encode($this->output) . "</textarea>";
	}
}

class xmlOutput extends objOutput{
	function __deconstruct() {
		header('Content-type: text/xml');
		if($php_errormsg)
		{
			$this->append("sqlerror", $php_errormsg);
		}
		$xml = new XMLWriter;
		foreach ($this->output as $index => $text){
            $xml->startElement($index);
	        $xml->text($text);
	        $xml->endElement();
        }
		echo $xml->getDocument();
	}
}
?>