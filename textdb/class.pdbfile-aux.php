<?php

// +----------------------------------------------------------------------+
// | Perfect Software                               class.pdbfile-aux.php |
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

class p_dbf_aux_readtb
{
 var $fp=array(); // File pointer
 var $data_pos=array(); // Positions
 var $n=array(); // Number of fields
 var $tb=array();
 var $db=array();

 function _find_salt (&$core)
 {
 	while ($salt=$core->_salt())
	{
		if (!isset($this->fp[$salt]))
			return $salt;
	}
 }

 function _load_tb (&$core, $tb)
 {
 	$db = $core->_getdb();
 	$salt = $this->_find_salt($core);
 	$this->fp[$salt] = fopen($core->path."/data/".$db."_".$tb.".txt", "r");
	if (!$this->fp[$salt])
		$core->_error($tb, "Could not open table data!");
	$fp_pos = fopen($core->path."/var/tbs/".$db."_".$tb."_pos.txt", "r");
	if (!$fp_pos)
		$core->_error($tb, "Could not open table auxiliary data!");
	
	$this->data_pos[$salt] = array();
//	$this->data_pos[$salt] = explode(":", trim( fread($fp_pos, filesize($core->path."/var/tbs/".$db."_".$tb."_pos.txt")) ));
	$size = filesize($core->path."/var/tbs/".$db."_".$tb."_pos.txt");
	if ($size > 0)
	{
		$size--;
		$this->data_pos[$salt] = explode(":", fread($fp_pos, $size));
	}

	fclose($fp_pos);
//	echo $n;
//	echo("\n".$core->path);
//	print_r($core->info);
	$this->n[$salt] = count($core->info[$db."_".$tb]);
//	$this->n[$salt] = $n;
	$this->tb[$salt] = $tb;
	$this->db[$salt] = $db;
//	echo $this->n[$salt] ;
	return $salt;
 }

 function _unload_tb (&$core, $salt)
 {
 	fclose($this->fp[$salt]);
	unset($this->fp[$salt]);
	unset($this->data_pos[$salt]);
	unset($this->n[$salt]);
	unset($this->tb[$salt]);
	unset($this->db[$salt]);
 }

 function _read_next_row (&$core, $salt)
 {
 	$row = array();
 	for ($i=0; $i<$this->n[$salt]; $i++)
	{
	 	$r = each($this->data_pos[$salt]);

		if ((!$r && $i==0) || feof($this->fp[$salt]))
		{
//			reset();
			return FALSE;
		}
//		elseif ((!$r && $i!=$this->n[$salt]-1) || feof($this->fp[$salt]))
//			$core->_error($this->tb[$salt], "Corrupted data!");

		if ($r[1] > 0)
			$row[$core->info [$this->db[$salt]."_".$this->tb[$salt]] [$i][0]] = fread($this->fp[$salt], $r[1]);
		else
			$row[$core->info [$this->db[$salt]."_".$this->tb[$salt]] [$i][0]] = null;
//		echo $row[$i]."(".$r[1].")"."\n";
	}
	return $row;
 }

 function _num_rows ($salt)
 {
 	$n = count($this->data_pos[$salt]) / $this->n[$salt];
	return $n;
 }
}

class p_dbf_aux_arraysort
{
 var $order;

 function _cmp ($a, $b, $p=0)
 {
 	$r = strnatcmp($a[ $this->order[$p][0] ], $b[ $this->order[$p][0] ]);
	if ($r == 0 && isset($this->order[$p+1]))
		return $this->_cmp($a, $b, $p+1);

	if ($this->order[$p][1] == "desc")
		return $r * -1;
	return $r;
 }

 function _order (&$array, &$order, &$order_values)
 {
	$this->order = $order;
	uasort($order_values, array($this, "_cmp") );
//	print_r($order_values);print_r($this->order);
	$n = count($array);
	$array2 = array();
	for ($i=0; $i<$n; $i++)
	{
		$k = key($order_values);
		$array2[$i] = $array[$k];
		next($order_values);
	}
	$array = $array2;
//	print_r($array);
 }
}

class p_dbf_aux_tmpfile
{
 var $fp=array();
 var $tb=array();

 function _find_salt (&$core)
 {
 	while ($salt=$core->_salt())
	{
		if (!isset($this->fp[$salt]) && !file_exists($core->path."/tmp/".$salt.".txt"))
			return $salt;
	}
 }

 function _create (&$core, $tb)
 {
 	$salt = $this->_find_salt($core);
 	$this->fp[$salt] = fopen($core->path."/tmp/".$salt.".txt", "w");
	if (!$this->fp[$salt])
		$core->_error($tb, "Could not open temporary data!");
	chmod($core->path."/tmp/".$salt.".txt", 0666);
	$this->tb[$salt] = $tb;
	return $salt;
 }

 function _add (&$core, $salt, &$value)
 {
 	fwrite($this->fp[$salt], $value);
 }

 function _close (&$core, $salt)
 {
 	fclose($this->fp[$salt]);
 }

 function _cp (&$core, $salt, $to)
 {
 	if (!copy($core->path."/tmp/".$salt.".txt", $to))
		$core->_error($this->tb[$salt], "Could not copy temporary file ".$salt);
 }

 function _del (&$core, $salt)
 {
 	if (!unlink($core->path."/tmp/".$salt.".txt"))
		$core->_error($this->tb[$salt], "Could not remove temporary file ".$salt);
	unset($this->fp[$salt]);
 }

 function _clearall (&$core)
 {
 	while (current($this->fp))
	{
		fclose(current($this->fp));
		unlink($core->path."/tmp/".key($this->fp).".txt");
		next($this->fp);
	}
 }
}

class p_dbf_aux_auto_increment
{
 var $values;
 var $tb;
 var $fields;

 function p_dbf_aux_auto_increment (&$core, $tb)
 {
 	$salt = $core->readtb->_load_tb($core, $tb);

	$this->tb = $tb;
	$this->values = array();
	$this->fields = array();

	$db = $core->_getdb();
	$n = count($core->info[$db."_".$tb]);
	for ($i=0; $i<$n; $i++)
	{
		if ($core->info[$db."_".$tb][$i][4])
			$this->fields[] = $core->info[$db."_".$tb][$i][0];
	}
//	print_r($this->fields);
	$n = count($this->fields);
	$j = 0;
	while ($row = $core->readtb->_read_next_row($core, $salt))
	{
		$this->values[$j] = array();
		for ($i=0; $i<$n; $i++)
			$this->values[$j][ $this->fields[$i] ] = $row[$this->fields[$i]];
		$j++;
	}

	$core->readtb->_unload_tb($core, $salt);
 }

 function _add (&$core, &$list)
 {
 	$db = $core->_getdb();
 	$n = count($list);
//	$n2 = count($this->values);

	while (list($k, $row) = each($this->values))
	{
		for ($i=0; $i<$n; $i++)
		{
			$pos = $core->_field_pos($list[$i][0], $this->tb);
			if ($core->info[$db."_".$this->tb][$pos][4] && $row[$list[$i][0]] >= $list[$i][1])
				$list[$i][1] = $row[$list[$i][0]] + 1;
		}
	}

	end($this->values);
	$k = key($this->values) + 1;
	reset($this->values);
	$n = count($this->fields);
	for ($i=0; $i<$n; $i++)
		$this->values[$k][ $this->fields[$i] ] = $core->_getvalue($this->fields[$i], $list);
 }
}

class p_dbf_aux_check_key
{
 var $values;
 var $tb;
 var $fields;

 function p_dbf_aux_check_key (&$core, $tb)
 {
 	$salt = $core->readtb->_load_tb($core, $tb);

	$this->tb = $tb;
	$this->values = array();
	$this->fields = array();

	$db = $core->_getdb();
	$n = count($core->info[$db."_".$tb]);
	for ($i=0; $i<$n; $i++)
	{
		if ($core->info[$db."_".$tb][$i][5])
			$this->fields[] = $core->info[$db."_".$tb][$i][0];
	}
//	print_r($this->fields);
	$n = count($this->fields);
	$j = 0;
	while ($row = $core->readtb->_read_next_row($core, $salt))
	{
		$this->values[$j] = array();
		for ($i=0; $i<$n; $i++)
			$this->values[$j][ $this->fields[$i] ] = $row[$this->fields[$i]];
		$j++;
	}

	$core->readtb->_unload_tb($core, $salt);
 }

 function _add (&$core, &$list)
 {
 	$db = $core->_getdb();
 	$n = count($list);
//	$n2 = count($this->values);

	while (list($k, $row) = each($this->values))
	{
		for ($i=0; $i<$n; $i++)
		{
			$pos = $core->_field_pos($list[$i][0], $this->tb);
			if ($core->info[$db."_".$this->tb][$pos][5] && $row[$list[$i][0]] == $list[$i][1])
				$core->_error($this->tb, "Field ".$list[$i][0]." of table ".$this->tb." is configured as key, so it may not have repeated values.");
		}
	}

	end($this->values);
	$k = key($this->values) + 1;
	reset($this->values);
	$n = count($this->fields);
	for ($i=0; $i<$n; $i++)
		$this->values[$k][ $this->fields[$i] ] = $core->_getvalue($this->fields[$i], $list);
 }
}

?>
