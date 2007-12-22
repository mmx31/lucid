<?php
	if(!isset($Base))
	{
		class Item {
			var $_parentModel = null;
			function __call($method, $arguments)
			{
				//map this to the parent model
				$p = $this->_make_parent();
				return call_user_func_array(array($p, $method), $arguments);
			}
			function _make_parent()
			{
				$parent = $this->_parentModel;
				$p = new $parent;
				foreach($this as $prop => $val)
				{
					$p->$prop = $val;
				}
				return $p;
			}
			function save()
			{
				$p = $this->_make_parent();
				$p->save();
				if(!isset($this->id)) {
					$this->id = mysql_insert_id();
				}
				mysql_close($link);
			}
		}
		
		class Base
		{
			var $id = array(
				'type' => "int",
				'length' => 11,
				'auto_increment' => true,
				'null' => false,
				'primary_key' => true
			);
			var $_parentItem = null;
			var $_result = false;
			var $_link;
			function __construct() {				
				$p = new Item(func_get_args());
				$p->_parentModel = get_class($this);
				return $p;
			}
			
			function _connect() {
				if(!$this->_link) {
					$this->_link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password']) or internal_error("db_connect_err");
					mysql_select_db($GLOBALS['db']['database'], $this->_link) or internal_error("db_select_err");
				}
			}
			
			function _query($str) {
				$this->_connect();
				$this->_result = mysql_query($str, $this->_link) or internal_error("db_query_err");
				return $this->_result;
			}
			
			function __deconstruct()
			{
				if($this->_result) mysql_free_result($this->_result);
				mysql_close($this->_link);
			}
			
			function save()
			{
				if(is_numeric($this->id)) { $sql = "UPDATE ${table} SET "; }
				else { $sql = "INSERT INTO ${table} SET "; }
				$arr = array();
				foreach($this as $key => $value)
				{
					if($key{0} != "_" && $key != "id")
					{
						if(is_int($value))
						{
							@array_push($arr, $this->_escape($key) . "=" . $value);
						}
						else
						{
							//when all else fails, make it a string
							@array_push($arr, $this->_escape($key) . "=\"" . $this->_escape($value) ."\"");
						}
					}
				}
				$sql .= implode(', ',$arr);
				if($type == "update") { $sql .= " WHERE `ID`=${id} LIMIT 1"; }
				$this->_query($sql);
			}
			
			function get($id)
			{
				$tablename = $this->_get_tablename();
                if(!is_numeric($id))
                {
                    $id = "'" . $this->_escape($id) . "'"; 
                }
				$this->_query("SELECT * FROM ${tablename} WHERE `ID`=${id} LIMIT 1");
				$line = mysql_fetch_array($this->_result, MYSQL_ASSOC);
				if($line)
				{
					$p = $this->_makeModel($line);
					mysql_free_result($result);
					mysql_close($link);
					return $p;
				}
				else
				{
					mysql_free_result($result);
					mysql_close($link);
					return false;
				}
			}
			function _escape($str)
			{
				$this->_connect();
				return $this->_escape($str, $this->_link);
			}
			function filter($feild, $value=false)
			{
				$tablename = $this->_get_tablename();
				if(is_array($feild))
				{
					$query = "SELECT * FROM ${tablename} WHERE ";
					$list = array();
					foreach($field as $key => $value)
					{
						array_push($list, $this->_escape($feild[$i]) . "=\"" . $this->_escape($value[$i]) . "\"");
					}
					$query .= implode(" AND ", $list);
				}
				else {
					$feild = $this->_escape($feild);
					//TODO: format value's datatype accordingly
					$value = $this->_escape($value);
					$query = "SELECT * FROM ${tablename} WHERE ${feild}=\"${value}\"";
				}
				$this->_query($query);
				$list = Array();
				while($line = mysql_fetch_array($this->_result, MYSQL_ASSOC))
				{
					array_push($list, $this->_makeModel($line));
					$results = TRUE;
				}
				if(!isset($results)) { return false; }
				else { return $list; }
			}
			function all()
			{
				$tablename = $this->_get_tablename();
				$this->_query("SELECT * FROM ${tablename}");
				$list = Array();
				while($line = mysql_fetch_array($this->_result, MYSQL_ASSOC))
				{
					array_push($list, $this->_makeModel($line));
				}
				return $list;
			}		
			function _get_tablename()
			{
				if(isset($this->_tablename))
				{
					$tablename=$this->_tablename;
				}
				else
				{
					$tablename=strtolower(get_class($this));
				}
				$db_prefix = $GLOBALS['db']['prefix'];
				return $db_prefix . $tablename;
			}
			function _makeModel($line)
			{
				$p = new Item;
				//mixin current values if we're not a table definition
				if(!is_array($this->id))
				{
					foreach ($this as $key => $value)
					{
						$p->$key = $value;
					}
				}
				//then add items provided to us
				foreach ($line as $key => $value)
				{
					$p->$key = $value;
				}
				if(isset($p->ID))
				{
					$p->id = $line['ID'];
					unset($p->ID);
				}
				$p->_parentModel = get_class($this);
				return $p;
			}
			function truncate() {
				$table = $this->_get_tablename();
				$this->_query("TRUNCATE TABLE `${table}`; ALTER TABLE `${table}` AUTO_INCREMENT = 1;");
			}
			function make_json($columns=false)
			{
				$list = array();
				$filter = is_array($columns);
				foreach($this as $key => $value)
				{
					if($key{0} != "_")
					{
						$continue = true;
						if($filter)
						{
							if(array_search($key, $columns)===false) $continue = false;
						}
						if($continue)
						{
							$list[$key] = $value;
						}
					}
				}
				return json_encode($list);
			}
			function delete()
			{
				if(isset($this->id))
				{
					$this->_query("DELETE FROM " . $this->_get_tablename() . " WHERE ID=" . $this->id . " LIMIT 1");
				}
			}
		}
		$Base = Base;
	}
?>
