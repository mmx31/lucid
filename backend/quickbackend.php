<?php
/**
 * Quick Backend
 * @projectDescription AJAX backends made easy
 * @license LGPL
 * @author Psychiccyberfreak
 * @version 0.1
 */
/**
 * The Quick Backend class
 * @classDescription contains functions that make ajax backend creation easier
 */
class qback
{
	/** 
	 * Closes a mysql connection
 	 * @alias qback::close
	 * @param {Handle} $link	The link to close
	 * @param {Mixed} [$result]	The result to clear
	 */
	function close($link, $result=null)
	{
		if($result != null) mysql_free_result($result);
		mysql_close($link);	
	}
	/** 
	 * Executes a mysql query. Replaces '#__' with the table prefix
 	 * @alias qback::query
	 * @param {String} $query	The query to execute
	 * @return {Mixed}	The mysql result
	 */
	function query($query)
	{
		require("configuration.php");
		$query = str_replace("#__", $db["prefix"], $query);
		$result = mysql_query($query) or die('Query failed: ' . mysql_error());
		return $result;
	}
	/** 
	 * Takes care of uploaded files
 	 * @alias qback::upload
	 * @param {File} $file	The file to move
	 * @param {String} $toDir	The directory to move the file to
	 * @param {String} [$newName]	The new file name, including the file extention
	 * @return {Mixed}	Returns true if everything was OK, "err" if there was a problem while uploading, and "exists" if the file in that directory allready exists.
	 */
	function upload($file, $toDir, $newName)
	{
		if(!isset($newName)) $newName = $file["name"];
		if ($file["error"] > 0)
		{
			return "err";
		}
		else
		{		
			if (file_exists($toDir . $newName))
			{
				return "exists"; //file allready exists
			}
			else
			{
			move_uploaded_file($file["tmp_name"],
			$toDir . $newName);
			return true;
			}
		}
	}
	/** 
	 * Hashes a string such as a password
 	 * @alias qback::hashPass
	 * @param {String} $pass	The string to hash
	 * @return {String}	The hashed string
	 */
	function hash($pass)
	{
		require("configuration.php");
		return crypt($pass, $conf["salt"]);
	}
	/** 
	 * Compares two strings, one hashed, and one not. Usefull for user authentication.
	 * @alias qback::comparePass
	 * @param {String} $providedPass	The unhashed password (for example the one provided from a login form)
	 * @param {String} $hashedPass	The hashed password (for example the one on record from a database)
	 * @return {Boolean}	true if the two passwords are the same, false if they are different
	 */
	function comparePass($providedPass, $hashedPass)
	{
		require("configuration.php");
		qback::hash($providedPass);
		if($pass == $hashedPass)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	/** 
	 * Escapes a string or an array of strings
	 * @alias qback::esc
	 * @param {Array|String}	The string or array to escape
	 * @return {Array|String}	The escaped array or string 
	 */
	function esc($str)
	{
		if(isset($str[1]))
		{
			for($i=0; $i < count($str); $i++)
			{
				$str[i] = mysql_real_escape_string($str[i]);
			}
			return $str;
		}
		else return mysql_real_escape_string($str);
	}
	/** 
	 * Escapes a string or an array of strings
	 * @alias qback::mysqlLink
	 * @param {String} [$dbname]	The database to use. If none is supplied the one defined in the configuration file is used.
	 * @return {Handle}	The connection's handle
	 */
	function mysqlLink()
	{
		require("configuration.php");
		if(func_num_args() == 1) $dbname = func_get_arg(0);
		$link = mysql_connect($db["host"], $db["username"], $db["password"]) or die('Could not connect: ' . mysql_error());
		if($dbname != NULL)
		{
			mysql_select_db($dbname) or die('Could not select database '.$dbname);
		}
		else
		{
			mysql_select_db($db["database"]) or die('Could not select database '.$db["name"]);
		}
		return $link;
	}
	/** 
	 * Takes a mysql result and converts it into json.
	 * @alias qback::toJSON
	 * @param {Array} $resultset	The resultset from a mysql query to print out
	 * @param {Integer} $affectedRecords	The number of affected records, usually just mysql_affected_rows()
	 * @return {String} $json	The json of the provided mysql result
	 */
	function toJSON($resultSet, $affectedRecords)
	{
		//TODO: get the "never print these" thing working
		$numberRows=0;
		$arrfieldName=array();
		$i=0;
		$json="";
	    while ($i < mysql_num_fields($resultSet))  {
	        $meta = mysql_fetch_field($resultSet, $i);
	        if (!$meta) {
	        }else{
	        $arrfieldName[$i]=$meta->name;
	        }
	        $i++;
	    }
	     $i=0;
	      $json="[\n";
	    while($row=mysql_fetch_array($resultSet, MYSQL_NUM)) {
	        $i++;
	        //print("Ind ".$i."-$affectedRecords<br>");
	        $json.="{\n";
	        for($r=0;$r < count($arrfieldName);$r++) {
	            $json.="\"".str_replace('_', ' ', $arrfieldName[$r])."\" :    ";
				$string = str_replace("\r\n", "\\r\\n", $row[$r]);
				$string = str_replace("\r", "\\r", $string);
				$string = str_replace("\n", "\\n", $string);
				$json .= "\"".$string."\"";
	            if($r < count($arrfieldName)-1){
	                $json.=",\n";
	            }else{
	                $json.="\n";
	            }
	        }
	        
	        
	         if($i!=$affectedRecords){
	             $json.="},\n";
	         }else{
	             $json.="}\n";
	         }
	        
	        
	        
	    }
	    $json.="]";
	    
	    return $json;
	}
}
?>