<?php
class objOutput {
	var $output = Array();
	var $dooutput = false;
	function __construct($val=false) {
		if($val !== false) $this->set($val);
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
	function __construct($val=false) {
		if($val !== false) $this->set($val);
		error_log($val);
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

class xmlOutput {
	// see http://us2.php.net/manual/en/ref.xmlwriter.php
	var $_xml;
	var $dooutput = false;
	function __construct() {
		$this->_xml = new XMLWriter;
		$this->_xml->openMemory();
		$this->_xml->startDocument();
	}
	function __call($name, $args) {
		if(method_exists($this, $name))
			return call_user_func_array(array($this, $name), $args);
		return call_user_func_array(array($this->_xml, $name), $args);
	}
	function __destruct() {
		if($this->dooutput) {
			header('Content-type: text/xml; charset=utf-8"');
			$this->_xml->endDocument();
			echo $this->_xml->outputMemory(true);
		}
	}
	function attribute($name, $value) {
		$this->_xml->writeAttribute($name, $value);
	}
	function attributes($arr) {
		foreach($arr as $key => $val) {
			$this->attribute($key, $val);
		}
	}
}
?>
