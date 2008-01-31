<?php
class objOutput {
	var $output = Array();
	var $dooutput = false;
	function __construct($val) {
		if(isset($val)) $this->set($val);
	}
	function __destruct() {
		if($this->dooutput) {
			header("Content-Type: text/plain; charset=utf-8");
			print_r($output);
		}
	}
	function append($name, $item)
	{
		$this->output[$name] = $item;
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
		"db_query_err" => 6,
		"permission_denied" => 7,
		"mail_connect_err" => 8,
		"feature_not_available" => 9
	);
	function __construct($val) {
		if(isset($val)) $this->set($val);
	}
	function __destruct() {
		if($this->dooutput) {
			header("Content-Type: text/plain; charset=utf-8");
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

//this is a utility function for comment filtering that you may use from within a backend
function json_comment_filter($json) {
	$json = str_replace("/*", "/\*", $json);
	$json = str_replace("*/", "*\/", $json);
	$json = "/* " . $json . " */";
	return $json;
}

class jsonOutput extends objOutput {
	function __destruct() {
		if($this->dooutput) {
			//header("Content-Type: text/json-comment-filtered; charset=utf-8");
			header("Content-Type: text/json; charset=utf-8");
			if($php_errormsg)
			{
				$this->append("sqlerror", $php_errormsg);
			}
			$json = json_encode($this->output);
			//comment filtering is tricky in certain cases...
			//$json = json_comment_filter($json);
			echo $json;
		}
	}
}

class textareaOutput extends jsonOutput {
	function __destruct() {
		if($this->dooutput) {
			header("Content-Type: text/html; charset=utf-8");
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
		if($this->dooutput) {
			header('Content-type: text/xml; charset=utf-8"');
			if($php_errormsg)
			{
				$this->append("sqlerror", $php_errormsg);
			}
			$xml = new XMLWriter;
			foreach ($this->output as $index => $values){
				$xml->startElement($index);
				if(is_string($values)) $xml->text($values);
				else {
					foreach($values as $key => $value) {
						if($key != "innerText") $xml->writeAttribute($key, $value);
					}
					$xml->text($values["innerText"] or "");
				}
        		$xml->endElement();
    		}
			echo $xml->getDocument();
		}
	}
}
?>