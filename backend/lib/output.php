<?php
class objOutput {
	var $output = Array();
	var $dooutput = false;
	function __destruct() {
		if($dooutput) {
			print_r($output);
		}
	}
	function append($name, $item)
	{
		$this->output->$name = $item;
		$this->dooutput = true;
	}
	function set($arr)
	{
		$this->output = $arr;
		$this->dooutput = true;
	}
	function clear()
	{
		$this->output = Array();
		$this->dooutput = false;
	}
}
class intOutput {
	var $output = 0;
	var $dooutput = true;
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
		if($this->dooutput) {
			echo $this->output;
		}
	}
	function clear() {
		$this->output = "";
		$this->dooutput = false;
	}
	function set($val)
	{
		if(is_string($val))
		{
			$val = $this->types[$val];
		}
		$this->output = $val;
		$this->dooutput = true;
	}
}

class jsonOutput extends objOutput {
	function __destruct() {
		if($dooutput) {
			if($php_errormsg)
			{
				$this->append("sqlerror", $php_errormsg);
			}
			echo json_encode($this->output);
		}
	}
}

class textareaOutput extends jsonOutput {
	function __destruct() {
		if($dooutput) {
			if($php_errormsg)
			{
				$this->append("sqlerror", $php_errormsg);
			}
			echo "<textarea>" . json_encode($this->output) . "</textarea>";
		}
	}
}

class xmlOutput extends objOutput{
	function __destruct() {
		if($dooutput) {
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
}
?>
