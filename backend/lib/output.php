<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


import('lib.Json.Json');

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
	function flush()
	{
		$this->__destruct();
		$this->dooutput = false;
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
		"feature_not_available" => 9,
		"object_not_found" => 10,
		"already_installed" => 11,
		"quota_exceeded" => 12,
		"remote_authentication_failed" => 13,
		"remote_connection_failed" => 14,
		"not_compatible" => 15,
        "token_mismatch" => 16
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
			if(isset($php_errormsg))
			{
				$this->append("core_error", $php_errormsg);
			}
			$json = Zend_Json::encode($this->output);
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
			if(isset($php_errormsg))
			{
				$this->append("core_error", $php_errormsg);
			}
			echo "<textarea>" . Zend_Json::encode($this->output) . "</textarea>";
		}
	}
}

class flashOutput extends jsonOutput {
	function __destruct() {
		if($this->dooutput) {
			header("Content-Type: text/plain; charset=utf-8");
			if(isset($php_errormsg))
			{
				$this->append("core_error", $php_errormsg);
			}
			$arr = array();
			foreach($this->output as $key => $value) {
			    $arr[] = $key."=".$value;
			}
			echo implode(",", $arr);
		}
	}
}

class filterableOutput extends jsonOutput {
	function __destruct() {
		if($this->dooutput) {
			//header("Content-Type: text/json-comment-filtered; charset=utf-8");
			header("Content-Type: text/json; charset=utf-8");
			$this->_filter();
			$this->_sort();
			$numRows = count($this->output);
			$this->_page();
			$json = Zend_Json::encode(array('numRows'=>$numRows, 'items'=>$this->output, 'identity'=>'id'));
			echo $json;
		}
	}
	function _filter() {
		$allItems = $this->output;
		$q = "";
		if (array_key_exists("q", $_REQUEST)) {
			$q = $_REQUEST['q'];
		}else if (array_key_exists("name", $_REQUEST)) {
			$q = $_REQUEST['name'];
		}
		
		if (strlen($q) && $q[strlen($q)-1]=="*") {
			$q = substr($q, 0, strlen($q)-1);
		}
		$ret = array();
		foreach ($allItems as $item) {
			if (!$q || strpos(strtolower($item['name']), strtolower($q))===0) {
				$ret[] = $item;
			}
		}
		$this->output = $ret;
	}
	function _sort() {
		$ret = $this->output;
		if (array_key_exists("sort", $_REQUEST)) {
			$sort = $_REQUEST['sort'];
			// Check if $sort starts with "-" then we have a DESC sort.
			$desc = strpos($sort, '-')===0 ? true : false;
			$sort = strpos($sort, '-')===0 ? substr($sort, 1) : $sort;
			if (in_array($sort, array_keys($ret[0]))) {
				$toSort = array();
				foreach ($ret as $i) $toSort[$i[$sort]] = $i;
				if ($desc) krsort($toSort); else ksort($toSort);
				$newRet = array();
				foreach ($toSort as $i) $newRet[] = $i;
				$ret = $newRet;
			}
		}
		$this->output = $ret;
	}
	function _page() {
		$ret = $this->output;
		if (array_key_exists("start", $_REQUEST)) {
			$ret = array_slice($ret, $_REQUEST['start']);
		}
		if (array_key_exists("count", $_REQUEST)) {
			$ret = array_slice($ret, 0, $_REQUEST['count']);
		}
		$this->output = $ret;
	}
}
