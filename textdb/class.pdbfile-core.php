<?php

// +----------------------------------------------------------------------+
// | Perfect Software                              class.pdbfile-core.php |
// | Brazilian Organization                                               |
// +----------------------------------------------------------------------+
// | Perfect Database File v2.0                                           |
// | Created By Eduardo Henrique Molina da Cruz                           |
// | <eduardomcruz@terra.com.br>                                          |
// +----------------------------------------------------------------------+
// | http://www.perfectsoftware.org                                       |
// +----------------------------------------------------------------------+
// | Under GPL License                                                    |
// +----------------------------------------------------------------------+
// | This program is free software; you can redistribute it and/or modify |
// |   it under the terms of the GNU General Public License as published  |
// |   by the Free Software Foundation; either version 2 of the License,  |
// |   or (at your option) any later version.                             |
// |                                                                      |
// |   This program is distributed in the hope that it will be useful,    |
// |   but WITHOUT ANY WARRANTY; without even the implied warranty of     |
// |   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the      |
// |   GNU General Public License for more details.                       |
// |                                                                      |
// |   You should have received a copy of the GNU General Public License  |
// |   along with this program; if not, write to the Free Software        |
// |   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA           |
// |   02111-1307  USA                                                    |
// +----------------------------------------------------------------------+

class p_dbf_core
{

 /*
 	The variables of the class
 */

 // The information of the tables
 var $info = array();

 //Total Path to the directory where the databases are stored
 var $path;
 
 // Array with the results
 var $results = array();
 var $results_p = array();

 var $db = null;
 var $adb = null;

 var $readtb; // class
 var $tmpfile; // class

 //////////////////////////////////////////////////////////////////////////

 function begin (&$path)
 {
 	$this->path = $path;
	$this->readtb = new p_dbf_aux_readtb;
	$this->tmpfile = new p_dbf_aux_tmpfile;
 }

 function escape_string ($str)
 {
 	$str = str_replace("\\", "\\\\", $str);
	$str = str_replace("'", "\\'", $str);

 	return $str;
 }

 function fetch_array ($rid)
 {
 	if (!isset($this->results[$rid]))
		return false;
 	elseif (!isset($this->results[$rid][ $this->results_p[$rid] ]))
	{
		$this->results_p[$rid] = (int)0;
		return false;
	}
	else
	{
		$row = $this->results_p[$rid];
		$this->results_p[$rid]++;
		return $this->results[$rid][$row];
	}
 }

 function fetch_row ($rid)
 {
 	if (!isset($this->results[$rid]))
		return false;
 	elseif (!isset($this->results[$rid][ $this->results_p[$rid] ]))
	{
		$this->results_p[$rid] = (int)0;
		return false;
	}
	else
	{
		$row = array();
		while (list($k, $v) = each($this->results[$rid][ $this->results_p[$rid] ]))
			$row[] = $v;
		reset($this->results[$rid][ $this->results_p[$rid] ]);
		$this->results_p[$rid]++;
		return $row;
	}
 }

 function num_rows ($rid)
 {
 	if (!isset($this->results[$rid]))
		return false;
	else
		return count($this->results[$rid]);
 }

 function result ($rid, $row, $field)
 {
 	if (!isset($this->results[$rid][$row][$field]))
		return false;
	else
		return $this->results[$rid][$row][$field];
 }

 function select_db ($db)
 {
 	$this->_db_check($db);
 	$this->db = $db;
	$this->adb = $db;
 }

 function _check_field (&$value, $pos, $tb)
 {
 	$db = $this->_getdb();
	$p = $db."_".$tb;

	// check null
	if ( !$this->info[$p][$pos][3] && $value==NULL)
		$this->_error($tb, "Field ".$this->info[$p][$pos][0]." of table ".$tb." is defined as NOT NULL.");
	elseif ($this->info[$p][$pos][3] && $value==NUll)
		return true;

	// check type
	if ($this->info[$p][$pos][1] == "int")
	{
		if (!is_numeric($value) || eregi("\.", $value))
			$this->_error($tb, "Field ".$this->info[$p][$pos][0]." of table ".$tb." must be an integer value.");
	}
	elseif ($this->info[$p][$pos][1] == "float")
	{
		if (!is_numeric($value))
			$this->_error($tb, "Field ".$this->info[$p][$pos][0]." of table ".$tb." must be a float value.");
	}

	// check size
	if ($this->info[$p][$pos][2])
	{
		if (strlen($value) > $this->info[$p][$pos][2])
			$this->_error($tb, "Field ".$this->info[$p][$pos][0]." of table ".$tb." has the limit of ".$this->info[$p][$pos][2]." characters.");
	}

	return true;
 }

 function _check_fields (&$row, $tb)
 {
 	$db = $this->_getdb();
 	$p = $db."_".$tb;	
	$n = count($row);
	
	for ($i=0; $i<$n; $i++)
	{
		$this->_check_field($row[$i][1], $this->_field_pos($row[$i][0], $tb), $tb); // value, position, table
	}
 }

 function _check_fields_exist ($tb, &$fields)
 {
 	$db = $this->_getdb();
	$p = $db."_".$tb;

	$n = count($this->info[$p]);
	$n2 = count($fields);
	for ($i=0; $i<$n2; $i++)
	{
		for ($j=0; $j<$n; $j++)
		{
			if ($this->info[$p][$j][0] == $fields[$i][0])
				break;
		}
		if ($j == $n)
			$this->_error($tb, "Field ".$fields[$i][0]." does not exists in table ".$tb);
	}
	return true;
 }

 function _check_tb ($tb, $die=1)
 {
 	$db = $this->_getdb();
	if (!file_exists($this->path."/data/".$db."_".$tb.".txt") && $die)
		$this->_error($tb, "Table ".$tb." does not exists!", 0);
	elseif (!file_exists($this->path."/data/".$db."_".$tb.".txt"))
		return false;
	return true;
 }

 function _check_lock_tb ($tb, $die=1)
 {
 	$db = $this->_getdb();
	if ($die && file_exists($this->path."/var/tbs/".$db."_".$tb."_lock.txt"))
		$this->_error($tb, "Table ".$tb." is locked!", 0);
	elseif (file_exists($this->path."/var/tbs/".$db."_".$tb."_lock.txt"))
		return false;
	return true;
 }


 function _create_tb (&$content)
 {
 	$db = $this->_getdb();
 	$n = count($content);
	for ($i=0; $i<$n; $i++)
	{
		// Create the files

		if ($this->_check_tb($content[$i][0], 0))
			die("Table ".$content[$i][0]." already exists!");
		
		$fp = fopen($this->path."/data/".$db."_".$content[$i][0].".txt", "w");
		if (!$fp)
			$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."!");
		fclose($fp);
		chmod($this->path."/data/".$db."_".$content[$i][0].".txt", 0666);

		$fp = fopen($this->path."/var/tbs/".$db."_".$content[$i][0]."_pos.txt", "w");
		if (!$fp)
			$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."!");
		fclose($fp);
		chmod($this->path."/var/tbs/".$db."_".$content[$i][0]."_pos.txt", 0666);

		$fp = fopen($this->path."/var/tbs/".$db."_".$content[$i][0]."_info.txt", "w");
		if (!$fp)
			$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."!");

		// Print the fields and attributes
		
		$n2 = count($content[$i]);
		for ($j=1; $j<$n2; $j++)
		{
			if (!$content[$i][$j][0])
				$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."! Fields name missing!");
				
			if ($content[$i][$j][1] == "char" && $content[$i][$j][4])
				$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."! Char fields can't have auto_increment option!");

			// check type
			if ($content[$i][$j][1] == "int" && $content[$i][$j][6])
			{
				if (!is_numeric($content[$i][$j][6]) || eregi("\.", $content[$i][$j][6]))
					$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."! Default value must be integer!");
			}
			elseif ($content[$i][$j][1] == "float" && $content[$i][$j][6])
			{
				if (!is_numeric($content[$i][$j][6]))
					$this->_error($content[$i][0], "Could not create table ".$content[$i][0]." of database ".$db."! Default value must be float!");
			}


			fwrite($fp, $content[$i][$j][0] . ",");
	
			if (!$content[$i][$j][1])
				fwrite($fp, ",");
			else
				fwrite($fp, $content[$i][$j][1] . ",");

			if (!$content[$i][$j][2])
				fwrite($fp, ",");
			else
				fwrite($fp, $content[$i][$j][2] . ",");

			if (!$content[$i][$j][3])
				fwrite($fp, "0,");
			else
				fwrite($fp, $content[$i][$j][3] . ",");

			if (!$content[$i][$j][4])
				fwrite($fp, "0,");
			else
				fwrite($fp, $content[$i][$j][4] . ",");

			if (!$content[$i][$j][5])
				fwrite($fp, "0,");
			else
				fwrite($fp, $content[$i][$j][5] . ",");

			if (!$content[$i][$j][6])
				fwrite($fp, "0:");
			else
			{
				$this->_do_datain($content[$i][$j][6]);
				fwrite($fp, strlen($content[$i][$j][6]) . ":");
				fwrite($fp, $content[$i][$j][6]);
			}

			fwrite($fp, "\n");
		}

		fclose($fp);
		chmod($this->path."/var/tbs/".$db."_".$content[$i][0]."_info.txt", 0666);
	}

	return true;
 }

 function _db_check ($db, $die=1)
 {
 	if (!file_exists($this->path."/var/dbs/".$db.".txt") && $die)
		die("Database ".$db." does not exists!");
	elseif (!file_exists($this->path."/var/dbs/".$db.".txt"))
		return false;
	return true;
 }

 function _db_create ($db)
 {
 	if ($this->_db_check($db, 0))
		die("Database ".$db." already exists!");
	$fp = fopen($this->path."/var/dbs/".$db.".txt", "w");
	if (!$fp)
		die("Could not create database ".$db);
	fclose($fp);
	chmod($this->path."/var/dbs/".$db.".txt", 0666);

	return true;
 }
 
 function _db_drop ($db)
 {
 	$this->_db_check($db);
	$len = strlen($db);

	$files = $this->_read_dir($this->path."/var/tbs/");
	foreach ($files as $file)
	{
		if (substr($file, 0, $len) == $db)
			unlink($this->path."/var/tbs/".$file);
	}

	$files = $this->_read_dir($this->path."/data/");
	foreach ($files as $file)
	{
		if (substr($file, 0, $len) == $db)
			unlink($this->path."/data/".$file);
	}

	unlink($this->path."/var/dbs/".$db.".txt");

	return true;
 }

 function _delete ($tb,&$where,&$where2)
 {
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);
	$this->_lock_tb($tb);
	$this->_load_tb_info($tb);

	$this->_check_fields_exist($tb, $values);
	$this->_check_fields($values, $tb);

	if ($where)
	{
		$this->_check_fields_exist($tb, $where2);
		$this->_check_fields($where2, $tb);
	}

	$n = count($this->info[$db."_".$tb]);

	$salt = $this->readtb->_load_tb($this, $tb);

	$tmp = $this->tmpfile->_create($this, $tb);
	$tmp2 = $this->tmpfile->_create($this, $tb);

	while ($row = $this->readtb->_read_next_row($this, $salt))
	{
		if (!$where || $this->_do_where($where, $row))
			continue;
		
		for ($i=0; $i<$n; $i++)
		{
			$this->tmpfile->_add($this, $tmp, $row[ $this->info[$db."_".$tb][$i][0] ]);
			$add = strlen($row[ $this->info[$db."_".$tb][$i][0] ]).":"; // to use reference
			$this->tmpfile->_add($this, $tmp2, $add);
		}
	}

	$this->tmpfile->_close($this, $tmp);
	$this->tmpfile->_cp($this, $tmp, $this->path."/data/".$db."_".$tb.".txt");
	$this->tmpfile->_del($this, $tmp);
	
	$this->tmpfile->_close($this, $tmp2);
	$this->tmpfile->_cp($this, $tmp2, $this->path."/var/tbs/".$db."_".$tb."_pos.txt");
	$this->tmpfile->_del($this, $tmp2);

	$this->readtb->_unload_tb($this, $salt);
	
	$this->_unload_tb_info($tb);
	$this->_unlock_tb($tb);
 }

 function _do_where (&$where, &$row)
 {
 	eval($where);
	return $ok;
 }

 function _do_row (&$row, $tb)
 {
 	$db = $this->_getdb();
	$p = $db."_".$tb;
	$row2 = array();
	$n = count($row);
	
	if ($n != count($this->info[$p]))
		$this->_error($tb, "The number of fields sent are incorrect for table ".$tb);

	for ($i=0; $i<$n; $i++)
	{
		$row2[$i] = array();
		$row2[$i][0] = $this->info[$p][$i][0];
		$row2[$i][1] =& $row[$i];
	}
	
	return $row2;
 }

 function _do_datain (&$data)
 {
 	$data = str_replace("\\'", "'", $data);
	$data = str_replace("\\\\", "\\", $data);
 }

 function _do_dataout (&$data)
 {
 	$data = str_replace("\\", "\\\\", $data);
 	$data = str_replace("'", "\\'", $data);
 }

 function _drop_tb ($tb)
 {
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);

	unlink($this->path."/data/".$db."_".$tb.".txt");
	unlink($this->path."/var/tbs/".$db."_".$tb."_info.txt");
	unlink($this->path."/var/tbs/".$db."_".$tb."_pos.txt");

	return true;
 }

 function _error ($tb, $error, $unlock=1)
 {
 	$this->adb = $this->db;
 	if ( !$this->_check_lock_tb($tb,0) && $unlock)
	 	$this->_unlock_tb($tb);
	$this->tmpfile->_clearall($this);
 	die("Perfect DB File CORE Error!<br>\n".$error);
 }

 function _field_pos ($field, $tb)
 {
 	$db = $this->_getdb();
	$p = $db."_".$tb;
	$n = count($this->info[$p]);

	for ($i=0; $i<$n; $i++)
	{
		if ($this->info[$p][$i][0] == $field)
			return $i;
	}
 }

 function _find_rid ()
 {
 	while ($salt=$this->_salt())
	{
		if (!isset($this->results[$salt]))
			return $salt;
	}
 }

 function _getdb()
 {
 	if ($this->adb == null)
		die("Database not selected!");
	return $this->adb;
 }

 function _getvalue ($field, &$list)
 {
	$n = count($list);
	for ($i=0; $i<$n; $i++)
	{
		if ($list[$i][0] == $field)
			return $list[$i][1];
	}
	return false;
 }

 function _gettbsize ($db, $tb)
 {
 	$data_size = filesize($this->path."/data/".$db."_".$tb.".txt");
	$aux_size = filesize($this->path."/var/tbs/".$db."_".$tb."_pos.txt") + filesize($this->path."/var/tbs/".$db."_".$tb."_info.txt");
	return array($data_size, $aux_size);
 }

 /*
 	Insert rows in a table
	$db: string, the database name
	$table: string, the database name
	$rows: array, the rows of values
 */
  
 function _insert ($table,&$rows)
 {
 	$db = $this->_getdb();
	$this->_check_tb($table);
	$this->_check_lock_tb($table);
	$this->_lock_tb($table);

	$this->_load_tb_info($table);
//	print_r($this->info);exit;

	$ainc = new p_dbf_aux_auto_increment($this, $table);
	$ckey = new p_dbf_aux_check_key($this, $table);

	$fp = fopen($this->path."/data/".$db."_".$table.".txt", "a");
	if (!$fp)
		$this->_error($table, "Could not open table ".$table." of database ".$db." data!");
	
	$fp2 = fopen($this->path."/var/tbs/".$db."_".$table."_pos.txt", "a");
	if (!$fp2)
		$this>_error($table, "Could not open table ".$table." of database ".$db." auxiliary data!");

 	$j = count($rows);

	for ($i=0; $i<$j; $i++)
	{
		$row = $this->_do_row($rows[$i], $table);
		
		$this->_check_fields($row, $table);
		$ainc->_add($this, $row);
		$ckey->_add($this, $row);

		$n = count($row);
		for ($z=0; $z<$n; $z++)
		{
			$this->_do_datain($row[$z][1]);
			fwrite($fp, $row[$z][1]);
			fwrite($fp2, strlen($row[$z][1]) . ":");
		}
	}

	unset($ckey);
	unset($ainc);
	fclose($fp);
	fclose($fp2);

	$this->_unload_tb_info($table);
	$this->_unlock_tb($table);
	return true;
 }

 function _list_dbs ()
 {
	$rid = $this->_find_rid();
	$this->results[$rid] = array();
	$this->results_p[$rid] = (int)0;

	$files = $this->_read_dir($this->path."/var/dbs/");
	$n = count($files);
	for ($i=0; $i<$n; $i++)
	{
		$db = substr($files[$i], 0, strlen($files[$i])-4);
		$this->results[$rid][$i] = array();
		$this->results[$rid][$i]['name'] = $db;
	}
	
	return $rid;
 }

 function _list_tbs ()
 {
 	$db = $this->_getdb();
	$rid = $this->_find_rid();
	$this->results[$rid] = array();
	$this->results_p[$rid] = (int)0;

	$files = $this->_read_dir($this->path."/data/");
	$n = count($files);
	$len = strlen($db);
	$j = 0;
	for ($i=0; $i<$n; $i++)
	{
		$db2 = substr($files[$i], 0, $len);
		if ($db2 == $db)
		{
			$this->results[$rid][$j] = array();
			$tb = substr($files[$i], strlen($db2)+1, strlen($files[$i])-strlen($db2)-1-4);
			list($dsize, $asize) = $this->_gettbsize($db, $tb);
			$this->results[$rid][$j]['name'] = $tb;
			$this->results[$rid][$j]['data_size'] = $dsize;
			$this->results[$rid][$j]['aux_size'] = $asize;

			$this->_check_lock_tb($tb);
			$this->_lock_tb($tb);
			$this->_load_tb_info($tb);
			$salt = $this->readtb->_load_tb($this, $tb);

			$this->results[$rid][$j]['num_rows'] = $this->readtb->_num_rows($salt);

			$this->readtb->_unload_tb($this, $salt);
			$this->_unload_tb_info($tb);
			$this->_unlock_tb($tb);

			$j++;
		}
	}
	
	return $rid;
 }

 function _list_fields ($tb)
 {
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);
	$this->_lock_tb($tb);
	$this->_load_tb_info($tb);
	
	$rid = $this->_find_rid();
	$this->results[$rid] = array();
	$this->results_p[$rid] = (int)0;
	$p = $db."_".$tb;
	$n = count($this->info[$p]);
	
	for ($i=0; $i<$n; $i++)
	{
		$this->results[$rid][$i]['name'] = $this->info[$p][$i][0];
		$this->results[$rid][$i]['type'] = $this->info[$p][$i][1];
		$this->results[$rid][$i]['size'] = $this->info[$p][$i][2];
		$this->results[$rid][$i]['null'] = $this->info[$p][$i][3];
		$this->results[$rid][$i]['auto_increment'] = $this->info[$p][$i][4];
		$this->results[$rid][$i]['key'] = $this->info[$p][$i][5];
		$this->results[$rid][$i]['default'] = $this->info[$p][$i][6];
	}
	
	$this->_unload_tb_info($tb);
	$this->_unlock_tb($tb);

	return $rid;
 }

 function _load_tb_info ($table)
 {
	$db = $this->_getdb();
	$p = $db."_".$table;
	$this->info[$p] = array();

	$fp = fopen($this->path."/var/tbs/".$db."_".$table."_info.txt", "r");
	if (!$fp)
		$this->_error($table, "Could not load table ".$table." of database ".$db."!");
	
//	$info = explode("\n", trim( fread($fp, filesize($this->path."/var/tbs/".$db."_".$table."_info.txt")) ));
	$info = fread($fp, filesize($this->path."/var/tbs/".$db."_".$table."_info.txt"));
	fclose($fp);

	$pos = 0;
	$max = strlen($info);
	for ($i=0; $pos < $max; $i++)
	{
		$name = null;
		while ($info[$pos] != ",")
		{
			$name .= $info[$pos];
			$pos++;
		}
		$pos++;

		///

		$type = null;
		while ($info[$pos] != ",")
		{
			$type .= $info[$pos];
			$pos++;
		}
		$pos++;

		///

		$size = null;
		while ($info[$pos] != ",")
		{
			$size .= $info[$pos];
			$pos++;
		}
		$pos++;

		///

		$null = 0;
		if ($info[$pos] == 1)
			$null = 1;
		$pos+=2;

		///

		$auto = 0;
		if ($info[$pos] == 1)
			$auto = 1;
		$pos+=2;

		///

		$key = 0;
		if ($info[$pos] == 1)
			$key = 1;
		$pos+=2;

		///

		$dlen = null;
		while ($info[$pos] != ":")
		{
			$dlen .= $info[$pos];
			$pos++;
		}
		$pos++;
		if (!$dlen)
			$default = null;
		else
		{
			$default = substr($info, $pos, $dlen);
			$pos += $dlen;
		}

		$pos++; // newline

		$this->info[$p][$i] = array();
		$this->info[$p][$i][0] = $name;
		$this->info[$p][$i][1] = $type;
		$this->info[$p][$i][2] = $size;
		$this->info[$p][$i][3] = $null;
		$this->info[$p][$i][4] = $auto;
		$this->info[$p][$i][5] = $key;
		$this->info[$p][$i][6] = $default;
	}
//	print_r($this->info);
 }

 function _unload_tb_info ($tb)
 {
 	$db = $this->_getdb();
	unset($this->info[$db.$tb]);
 }

 function _lock_tb ($tb)
 {
 	$db = $this->_getdb();
 	$fp = fopen($this->path."/var/tbs/".$db."_".$tb."_lock.txt", "w");
	fclose($fp);
	chmod($this->path."/var/tbs/".$db."_".$tb."_lock.txt", 0666);
 }

 function _unlock_tb ($tb)
 {
 	$db = $this->_getdb();//echo "\n\n".$db."\nae\n";
 	unlink($this->path."/var/tbs/".$db."_".$tb."_lock.txt");
 }

 function _read_dir ($path)
 {
 	$files = array();
	if ($dir = opendir($path))
	{
		while (false !== ($file = readdir($dir)))
		{
       		if ($file != "." && $file != "..")
				$files[] = $file;
		}
		closedir($dir); 
	}
	return $files;
 }

 function _salt ($num=5)
 {
 	mt_srand((double)microtime()*1000000);
	$chars = array_merge(range('a','z'),range('A','Z'),range(0,9));
	
	$salt = null;
	
	for($i=0;$i<$num;$i++) {
		$salt .= $chars[mt_rand(0,count($chars)-1)];
	}
	return $salt;
 }

 function _select (&$fields, $tb, &$where, &$where2, &$order, &$limit)
 {//echo "\n\nnhhg".$tb;
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);
	$this->_lock_tb($tb);

	$this->_load_tb_info($tb);

	if ($fields[0][0] != "*")
		$this->_check_fields_exist($tb, $fields);
	if ($where)
	{
		$this->_check_fields_exist($tb, $where2);
		$this->_check_fields($where2, $tb);
	}
//print_r($this->info);
	$salt = $this->readtb->_load_tb($this, $tb);
	$rid = $this->_find_rid();
	$row = array();
	$this->results[$rid] = array();
	$n_fields = count($fields);
	$n_tb = count($this->info[$db."_".$tb]);
	$this->results_p[$rid] = (int)0;
//echo $this->readtb->_num_rows($salt);
//print_r($fields);
	if (!$limit)
		$limit = array(0, -1);

	if ($order)
	{
		$this->_check_fields_exist($tb, $order);
		$order_values = array();
		$norder = count($order);
		$i = 0;

		while ($row = $this->readtb->_read_next_row($this, $salt))
		{
			// Where
			if ($where && !$this->_do_where($where, $row))
				continue;

			for ($j=0; $j<$n_tb; $j++)
			{
				$name = $this->info[$db."_".$tb][$i][0];
				if ($this->info[$db."_".$tb][$i][6] && strlen($row[$name])==1 && !$row[$name])
					$row[$name] = $this->info[$db."_".$tb][$i][6];
			}

			$order_values[$i] = array();
			
			for ($j=0; $j<$norder; $j++)
				$order_values[$i][ $order[$j][0] ] = $row[ $order[$j][0] ];
			
			if ($fields[0][0] == "*")
				$this->results[$rid][$i] = $row;
			else
			{
				for ($j=0; $j<$n_fields; $j++)
					$this->results[$rid][$i] [$fields[$j][0]] = $row[$fields [$j][0] ];
			}
			//print_r($row);
			$i++;
		}
		
		// Order
		$o = new p_dbf_aux_arraysort;
		$o->_order($this->results[$rid], $order, $order_values);
		unset($o);
		
		// Limit
		for ($i=0; $i<$limit[0] && isset($this->results[$rid][0]); $i++)
			array_shift($this->results[$rid]);
		if ($limit[1] != -1)
		{
			$j = $limit[1] - $limit[0];
			for ($i=$j; isset($this->results[$rid][$i]); $i++)
				unset($this->results[$rid][$i]);
		}
	}

	else
	{
		for ($i=0; $i<$limit[0] && $this->readtb->_read_next_row($this, $salt); $i++);
		
		$i = 0;
		$n = $limit[1] - $limit[0];
		while (($limit[1] == -1 || $i<$n) && $row = $this->readtb->_read_next_row($this, $salt))
		{
			// Where
			if ($where && !$this->_do_where($where, $row))
				continue;

			for ($j=0; $j<$n_tb; $j++)
			{
				$name = $this->info[$db."_".$tb][$j][0];
//				echo $name;
				if ($this->info[$db."_".$tb][$j][6] && strlen($row[$name])==1 && !$row[$name])
					$row[$name] = $this->info[$db."_".$tb][$j][6];
			}

			if ($fields[0][0] == "*")
				$this->results[$rid][$i] = $row;
			else
			{
				for ($j=0; $j<$n_fields; $j++)
					$this->results[$rid][$i] [$fields[$j][0]] = $row[$fields [$j][0] ];
			}
			//print_r($row);
			$i++;
		}
	}

//	$this->_do_order($rid, $order, 0, 0, count($this->results[$rid])-1 );
//	print_r($order_values);
//	print_r($this->results);
//	 echo "\n\n----------------\n".$i." rows in ".filesize($db."_".$tb.".txt")." bytes";
//	print_r($this->results);
	$this->readtb->_unload_tb($this, $salt);

	$this->_unload_tb_info($tb);
	$this->_unlock_tb($tb);

	return $rid;
 }

 function _show_create_tb ($tb)
 {
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);
	$this->_lock_tb($tb);
	$this->_load_tb_info($tb);
	
	$rid = $this->_find_rid();
	$this->results[$rid] = array();
	$this->results_p[$rid] = (int)0;
	$p = $db."_".$tb;
	$n = count($this->info[$p]);
	
	$content = "CREATE TABLE `".$tb."`\n(";
	for ($i=0; $i<$n; $i++)
	{
		$content .= "\t`" . $this->info[$p][$i][0] . "`";

		if ($this->info[$p][$i][1] != null)
			$content .= " " . strtoupper($this->info[$p][$i][1]);

		if ($this->info[$p][$i][2])
			$content .= " (" . $this->info[$p][$i][2] . ")";

		if ($this->info[$p][$i][3])
			$content .= " NULL";
		else
			$content .= " NOT NULL";

		if ($this->info[$p][$i][4])
			$content .= " AUTO_INCREMENT";

		if ($this->info[$p][$i][5])
			$content .= " KEY";

		if ($this->info[$p][$i][6])
		{
			$default = $this->info[$p][$i][6];
			$this->_do_dataout($default);
			$content .= " DEFAULT '".$default."'";
		}

		if ($i != $n-1)
			$content .= " ,\n";
	}
	$content .= "\n);";
	
	$this->results[$rid][0] = array();
	$this->results[$rid][0]['create'] = $content;
	
	$this->_unload_tb_info($tb);
	$this->_unlock_tb($tb);

	return $rid;
 }

 function _update ($tb,&$values,&$where,&$where2)
 {
 	$db = $this->_getdb();
	$this->_check_tb($tb);
	$this->_check_lock_tb($tb);
	$this->_lock_tb($tb);
	$this->_load_tb_info($tb);

	$this->_check_fields_exist($tb, $values);
	$this->_check_fields($values, $tb);

	if ($where)
	{
		$this->_check_fields_exist($tb, $where2);
		$this->_check_fields($where2, $tb);
	}

	$n = count($this->info[$db."_".$tb]);

	$tmp = $this->tmpfile->_create($this, $tb);
	$tmp2 = $this->tmpfile->_create($this, $tb);

	$ainc = new p_dbf_aux_auto_increment($this, $tb);
	$ckey = new p_dbf_aux_check_key($this, $tb);

	$salt = $this->readtb->_load_tb($this, $tb);

	while ($row = $this->readtb->_read_next_row($this, $salt))
	{
		if (!$where || $this->_do_where($where, $row))
		{
			$ainc->_add($this, $values);
			$ckey->_add($this, $values);

			for ($i=0; $i<$n; $i++)
			{
				$newvalue = $this->_getvalue($this->info[$db."_".$tb][$i][0], $values);
				if ($newvalue !== false)
				{
					$this->_do_datain($newvalue);
					$row[ $this->info[$db."_".$tb][$i][0] ] = $newvalue;
				}
			}
		}

		for ($i=0; $i<$n; $i++)
		{
			$this->tmpfile->_add($this, $tmp, $row[ $this->info[$db."_".$tb][$i][0] ]);
			$add = strlen($row[ $this->info[$db."_".$tb][$i][0] ]).":"; // to use reference
			$this->tmpfile->_add($this, $tmp2, $add);
		}
	}

	unset($ckey);
	unset($ainc);

	$this->tmpfile->_close($this, $tmp);
	$this->tmpfile->_cp($this, $tmp, $this->path."/data/".$db."_".$tb.".txt");
	$this->tmpfile->_del($this, $tmp);
	
	$this->tmpfile->_close($this, $tmp2);
	$this->tmpfile->_cp($this, $tmp2, $this->path."/var/tbs/".$db."_".$tb."_pos.txt");
	$this->tmpfile->_del($this, $tmp2);

	$this->readtb->_unload_tb($this, $salt);
	
	$this->_unload_tb_info($tb);
	$this->_unlock_tb($tb);
 }
 
} //end class

?>
