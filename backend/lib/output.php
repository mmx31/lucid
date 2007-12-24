<?php
class objOutput {
	var $output = Array();
	function __destruct() {
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
	function __destruct() {
		echo $this->output;
	}
	function set($val)
	{
		if(is_string($val))
		{
			$val = $this->types[$val];
		}
		$this->output = $val;
	}
}

class jsonOutput extends objOutput {
	function __destruct() {
		if($php_errormsg)
		{
			$this->append("sqlerror", $php_errormsg);
		}
		echo json_encode($this->output);
	}
}

class textareaOutput extends jsonOutput {
	function __destruct() {
		if($php_errormsg)
		{
			$this->append("sqlerror", $php_errormsg);
		}
		echo "<textarea>" . json_encode($this->output) . "</textarea>";
	}
}

class xmlOutput extends objOutput{
	function __destruct() {
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