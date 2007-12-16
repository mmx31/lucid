<?php
	if(!isset($Base))
	{
		class Item {
			var $_parentModel = null;
			function __call($method, $arguments)
			{
				//map this to the parent model
				$parent = $this->_parentModel;
				$p = new $parent;
				foreach($this as $prop => $val)
				{
					$p->$prop = $val;
				}
				return call_user_func_array(array($p, $method), $arguments);
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
			
			
			function __construct() {
				return new Item(func_get_args());
			}
			
			function get($id)
			{
				$tablename = $this->_get_tablename();
				$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
				   or die('Could not connect: ' . mysql_error());
				mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
                                if(!is_numeric($id))
                                {
                                    $id = "'" . mysql_real_escape_string($id) . "'"; 
                                }
				$query = "SELECT * FROM ${tablename} WHERE `ID`=${id} LIMIT 1";
				$result = mysql_query($query) or die($query . '<br />Query failed: ' . mysql_error());
				$line = mysql_fetch_array($result, MYSQL_ASSOC);
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
			function filter($feild, $value)
			{
				$tablename = $this->_get_tablename();
				$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
				   or die('Could not connect: ' . mysql_error());
				mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
				if(is_array($feild) && is_array($value))
				{
					$query = "SELECT * FROM ${tablename} WHERE ";
					for($i=0; $i < count($feild); $i++)
					{
						
						$query .= mysql_real_escape_string($feild[$i]) . "=\"" . mysql_real_escape_string($value[$i]) . "\"";
						if($i != count($feild)-1) { $query .= " AND "; }
					}
				}
				else {
					$feild = mysql_real_escape_string($feild);
					//TODO: format value's datatype accordingly
					$value = mysql_real_escape_string($value);
					$query = "SELECT * FROM ${tablename} WHERE ${feild}=\"${value}\"";
				}
				$result = mysql_query($query) or die('Query failed: ' . mysql_error());
				$list = Array();
				while($line = mysql_fetch_array($result, MYSQL_ASSOC))
				{
					array_push($list, $this->_makeModel($line));
					$results = TRUE;
				}
				mysql_free_result($result);
				mysql_close($link);
				if(!isset($results)) { return false; }
				else { return $list; }
			}
			function all()
			{
				$tablename = $this->_get_tablename();
				$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
				   or die('Could not connect: ' . mysql_error());
				mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
				$result = mysql_query("SELECT * FROM ${tablename}") or die('Query failed: ' . mysql_error());
				$list = Array();
				while($line = mysql_fetch_array($result, MYSQL_ASSOC))
				{
					array_push($list, $this->_makeModel($line));
				}
				mysql_free_result($result);
				mysql_close($link);
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
				foreach ($line as $key => $value)
				{
					$p->$key = $value;
				}
				if(isset($line['ID']))
				{
					$p->id = $line['ID'];
					unset($p->ID);
				}
				$p->_parentModel = get_class($this);
				//echo var_dump($p);
				return $p;
			}
			function from_postdata($postdata, $list)
			{
				if (get_magic_quotes_gpc())
				{
					foreach($list as $key)
					{
						$postdata[$key] = stripslashes($postdata[$key]);
					}
				}
				$this->_makeModel($postdata);
			}
			function truncate() {
				$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
            	   or die('Could not connect: ' . mysql_error());
				$table = $this->_get_tablename();
            	mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
				mysql_query("TRUNCATE TABLE `${table}`;");
				mysql_query("ALTER TABLE `${table}` AUTO_INCREMENT = 1;");
				mysql_close($link);
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
							$value = addslashes($value);
							$value = str_replace("\r", "\\r", $value);
							$value = str_replace("\n", "\\n", $value);
							$p = "\"". addslashes($key) . "\":";
	                        if(is_int($value) || $key == "id") {$p .= $value;}
	                        else {$p .= "\"" . $value . "\"";}
							$list[] = $p;
						}
					}
				}
				$s = join(", ", $list);
				$a = "({" . $s . "})";
				return $a;
			}
			function save()
			{
				$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
				   or die('Could not connect: ' . mysql_error());
				mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
                $query = $this->_make_mysql_query($this->_get_tablename(), (is_int($this->id) ? "update" : "insert"));
				mysql_query($query) or die($query . '\nQuery failed: ' . mysql_error());
				if(!isset($this->id)) { $this->id = mysql_insert_id(); }
				mysql_close($link);
			}
			function count()
			{
				//for some reason count($this) returns 0 so...
				$length = 0;
				foreach($this as $key => $value)
				{
					if(substr($key, 0, 1) != "_")
					{
						$length++;
					}
				}
				return $length;
			}
			function _make_mysql_query($table, $type)
			{
				//for some reason count($this) returns 0 so...
				$length = $this->count()-1;
				if($type == "update") { $sql = "UPDATE ${table} SET "; }
				else { $sql = "INSERT INTO ${table} SET "; }
				$arr = array();
				foreach($this as $key => $value)
				{
					if($key{0} != "_" && $key != "id")
					{
						if(is_int($value))
						{
							array_push($arr, mysql_real_escape_string($key) . "=" . $value);
						}
						else
						{
							//when all else fails, make it a string
							array_push($arr, mysql_real_escape_string($key) . "=\"" . mysql_real_escape_string($value) ."\"");
						}
					}
				}
				$sql .= implode(', ',$arr);
				$id=$this->id;
				if($type == "update") { $sql .= " WHERE `ID`=${id} LIMIT 1"; }
				return $sql;
			}
			function delete()
			{
				if(isset($this->id))
				{
                	$link = mysql_connect($GLOBALS['db']['host'], $GLOBALS['db']['username'], $GLOBALS['db']['password'])
                	   or die('Could not connect: ' . mysql_error());
                	mysql_select_db($GLOBALS['db']['database']) or die('Could not select database');
					mysql_query("DELETE FROM " . $this->_get_tablename() . " WHERE ID=" . $this->id . " LIMIT 1") or die('Query failed: ' . mysql_error());
                	mysql_close($link);
				}
			}
		}
		$Base = Base;
	}
?>
