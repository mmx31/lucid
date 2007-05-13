<?php

// +----------------------------------------------------------------------+
// | Perfect Software                               class.pdbfile-sql.php |
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

class p_dbf_sql extends p_dbf_core
{

 function p_dbf_sql($path)
 {
 	$this->begin($path);
 }

 function error ($error)
 {
	die($error);
 }

 /**
   * The sintax error_reporting funcion
   * $content (string): the query
   * $pos (int): the actual position in $content
   * returns nothing (void)
   */
 function error_sintax ($content,$pos)
 {
 	$pos = $this->next_word_pos($content,$pos);
	$error = "There is a mistake in the final of \"".substr($content,0,$pos)."\".";
	$this->error($error);
 }

 /**
   * Selects the final position of a part of the content
   * $content (pointer): points to the query
   * $pos (int): the actual position in $content
   * $delimiter (string): the delimiter used to find the final of the part
   * returns the final position of the content (int $pos-1)
   */
 function final_pos (&$content,$pos,$delimiter)
 {
	while (1)
	{
		$content2 = substr($content,$pos);
		$pos2 = strpos($content2,$delimiter);
		$pos = $pos + $pos2 +1;
		$i = (int)0;
		while (1)
		{
			$i++;
			if (substr($content2,$pos2-$i,1) != "\\")
			{
				$i--;
				break;
			}
		}
		$last = substr($i,strlen($i)-1,1);
		if (preg_match("/^[02468]$/si",$last))
			break;
//		if (substr($content2,$pos2-1,1) != "\\")
//			break;
	}
	return $pos-1;
 }

 /**
   * Parse the WHERE sintax
   * $query (pointer): points to the query
   * $pos (int): the start of the WHERE
   * returns an array with the parsed where (string $where)  and the final position of the where (int $pos)
   */
 function make_where (&$query,$pos)
 {
	$paren = (int)0;
	$where = "if (";
	$where2 = array();
	$a = "\$row['";
	$b = "']";
				
	while (1)
	{
		$word = $this->next_word($query,$pos);
		
		if ($word == "(")
		{
			$paren++;
			$where .= "(";
			$pos = $this->next_word_pos($query,$pos);
		}
		elseif ($word == ")")
		{
			$paren--;
			$where .= ")";
			$pos = $this->next_word_pos($query,$pos);
		}
		elseif ((strtoupper($word) == "ORDER" || strtoupper($word) == "LIMIT") && $paren == 0)
		{
			break;
		}
		elseif (strtoupper($word) == "AND" || strtoupper($word) == "OR")
		{
			$where .= " ".$word." ";
			$pos = $this->next_word_pos($query,$pos);
		}
		elseif (preg_match("/^[A-Za-z0-9_.]+$/si",$word) || $word == "`")
		{
			if ($word == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$field = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{
				$field = $word;
				$pos = $this->next_word_pos($query,$pos);
			}
					
			$signal1 = $this->next_word($query,$pos);
			$signal2 = $this->next_word($query,$pos,2);
			$signal3 = $this->next_word($query,$this->next_word_pos($query,$pos),4);

			if ($signal2 == "!=" || $signal2 == ">=" || $signal2 == "<=")
			{
				$pos = $this->next_word_pos($query,$pos,2); // After the signal
			
				if ($this->next_word($query,$pos) == "'")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"'");
					$content = substr($query,$pos,$final-$pos);
					$pos = $final + 1;
					$where .= "strtolower(" . $a . $field . $b . ")" . $signal2 . "strtolower('" . $content . "')";
				}
				else
				{
					$content = $this->next_word($query,$pos);
					
					if (!is_numeric($content))
						$this->error_sintax($query,$pos);

					$pos = $this->next_word_pos($query,$pos);
					$where .= $a . $field . $b . $signal2 . $content;
				}
				$where2[] = array($field, $content);
			}
			elseif ($signal1 == "=" || $signal1 == ">" || $signal1 == "<")
			{		
				if ($signal1 == "=")
					$signal1 = "==";
					
				$pos = $this->next_word_pos($query,$pos); // After the signal			

				if ($this->next_word($query,$pos) == "'")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"'");
					$content = substr($query,$pos,$final-$pos);
					$pos = $final + 1;
					$where .= "strtolower(" . $a . $field . $b . ")" . $signal1 . "strtolower('" . $content . "')";
				}
				else
				{
					$content = $this->next_word($query,$pos);
					
					if (!is_numeric($content))
						$this->error_sintax($query,$pos);

					$pos = $this->next_word_pos($query,$pos);
					$where .= $a . $field . $b . $signal1 . $content;
				}
				$where2[] = array($field, $content);
			}
			elseif (strtoupper($signal1) == "LIKE" || (strtoupper($signal1) == "NOT" && strtoupper($signal3) == "LIKE"))
			{
				$pos = $this->next_word_pos($query,$pos); // After the first signal

				if (strtoupper($signal1) == "NOT")
				{
					$pos = $this->next_word_pos($query,$pos); // After the second signal (if there is)
					$command = "!is_int(strpos";
				}
				else
					$command = "is_int(strpos";

				if ($this->next_word($query,$pos) == "'")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"'");
					$content = substr($query,$pos,$final-$pos);
					$pos = $final + 1;

					$where .= $command . "(" . "strtolower(" . $a . $field . $b . "),strtolower('" . $content . "')" . "))";
				}
				else
				{
					$content = $this->next_word($query,$pos);
					if (!is_numeric($content))
						$this->error_sintax($query,$pos);
					$pos = $this->next_word_pos($query,$pos);
					$where .= $command . "(" . "strtolower(" . $a . $field . $b . "),strtolower('" . $content . "')" . "))";
				}
				$where2[] = array($field, $content);
			}
			elseif (strtoupper($signal2) == "IS")
			{
				$pos = $this->next_word_pos($query,$pos); // After signal

				if (strtoupper($this->next_word($query,$pos)) == "NOT")
				{
					$pos = $this->next_word_pos($query,$pos);
					$signal = "!=";
				}
				else
					$signal = "==";

				if (strtoupper($this->next_word($query,$pos)) != "NULL")
					$this->error_sintax($query,$pos);

				$pos = $this->next_word_pos($query,$pos);

				$where .= $a . $field . $b . $signal . "null";

				$where2[] = array($field, null);
			}
			else
				$this->error_sintax($query,$pos);
		}
		elseif (!$word)
			break;
		else
			$this->error_sintax($query,$pos);
	}
	$where .= ")\n\t\$ok = 1;\nelse\n\t\$ok = 0;";
//	////print_r($where2);
	$array = array($where,$pos,$where2);
	return $array;
 }

 /**
   * Parse the ORDER sintax
   * $query (pointer): points to the query
   * $pos (int): the actual position in the query
   * returns an array with the list of the fields (string $order), the type (string $type) and the final position (int $pos)
   */
 function make_order (&$query,$pos)
 {
	if (strtoupper($this->next_word($query,$pos)) != "BY")
		$this->error_sintax($query,$pos);

	$pos = $this->next_word_pos($query,$pos);
	$order = array();
	$i = 0;

	while (1)
	{
		$fields = array();
		while (1) 
		{
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$fields[] = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{
				$fields[] = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}

			if ($this->next_word($query,$pos) == ",")
				$pos = $this->next_word_pos($query,$pos);
			else
				break;
		}

		if (strtoupper($this->next_word($query,$pos)) == "DESC")
		{
			$type = "desc";
			$pos = $this->next_word_pos($query,$pos);
		}
		elseif (strtoupper($this->next_word($query,$pos)) == "ASC")
		{
			$type = "asc";
			$pos = $this->next_word_pos($query,$pos);
		}
		else
			$type = "asc";

		foreach ($fields as $field)
		{
			$order[$i] = array();
			$order[$i][0] = $field;
			$order[$i][1] = $type;
			$i++;
		}

		unset($fields);
						
		if ($this->next_word($query,$pos) == ",")
		{
			$pos = $this->next_word_pos($query,$pos);
		}
		else
			break;
	}
	$array = array($order,$pos);
	return $array;
 }

 /**
   * Parse the LIMIT sintax
   * $query (pointer): points to the query
   * $pos (int): the actual position in the query
   * returns an array with the start position (int $first) and the final position (int $second) and the final position in the query (int $pos)
   */
 function make_limit (&$query,$pos)
 {
 	$first = $this->next_word($query,$pos);
	$pos = $this->next_word_pos($query,$pos);
	if (!is_numeric($first) || preg_match("/\./si",$first))
		$this->error_sintax($query,$pos);
	if ($this->next_word($query,$pos) == ",")
	{
		$pos = $this->next_word_pos($query,$pos);
		$second = $this->next_word($query,$pos);
		$pos = $this->next_word_pos($query,$pos);
		if (!is_numeric($second) || preg_match("/\./si",$second))
			$this->error_sintax($query,$pos);
		$second++;
	}
	else
	{
		$second = $first;
		$first = (int)0;
	}
	return array($first,$second,$pos);
 }

 /**
   * Gets the next word
   * $content (pointer): points to the query
   * $start (int): the actual position
   * $len (int): the length to be selected in case if the next word does not belongs to [A-Za-z0-9_.]
   * returns the word (string $word) if OK or bool false if not OK
   */
 function next_word (&$content,$start,$len=1)
 {
 	$pos = $this->next_word_pos2($content,$start);
	$content2 = substr($content,$pos);
	$first = substr($content2,0,$len);

	if (preg_match("/[A-Za-z0-9_.]/si",$first))
	{
		$word = preg_replace("/^([A-Za-z0-9_.]+).*$/si","\\1",$content2);
	}
	elseif ($first == null)
	{
		return false;
	}
	else
	{
		$word = $first;
	}
	return $word;
 }

 /**
   * Gets the position of the next word
   * $content (pointer): points to the query
   * $start (int): the actual position
   * $len (int): the length to be selected in case if the next word does not belongs to [A-Za-z0-9_.]
   * returns the position of the word (int $pos)
   */
 function next_word_pos (&$content,$start,$len=1)
 {
	$pos = $this->next_word_pos2($content,$start);
	$content2 = substr($content,$pos);
	$first = substr($content2,0,$len);

	if (preg_match("/[A-Za-z0-9_.]/si",$first))
	{
		$word = preg_replace("/^([A-Za-z0-9_.]+).*$/si","\\1",$content2);
	}
	else
	{
		$word = $first;
	}
	$pos = $pos + strlen($word);
	return $pos;
 }

 /**
   * Dependence of next_word() and next_word_pos()
   * $content (pointer): points to the query
   * $start (int): the actual position
   * returns the position of the beggining of the next word (int $pos)
   */
 function next_word_pos2 (&$content,$start)
 {
	$content2 = substr($content,$start);
	
	if (trim($content2) == null)
		return strlen($content);
	else
	{
		$i = (int)0;
		while (1)
		{
			if ($content2[$i] == " " || $content2[$i] == "\n" || $content2[$i] == "\t" || $content2[$i] == "\r")
				$i++;
			else
				break;
		}
		$pos = $start + $i;
		return $pos;
	}
 }

 function db_query ($db, $query)
 {
 	$this->_db_check($db);
	$this->adb = $db;
	$r = $this->query($query);
 	$this->adb = $this->db;
	return $r;
 }

 /**
   * Parse the query
   * $query (string): the query
   * returns the response of the core (void $ret)
   */
 function query ($query)
 {//echo "query: ".$query."<br>\n";
 	$query = $query."\n";
 	$pos = (int)0;

	while (1)
	{
		$word = $this->next_word($query,$pos);
		$pos = $this->next_word_pos($query,$pos);

		// Prepare for select

		if (strtoupper($word) == "SELECT")
		{//echo "tipo: ".$word."<br>\n";

			// Detects the fields
			$fields = array();
			$i = 0;
		
			if ($this->next_word($query,$pos) == "*")
			{
				$fields[$i] = array();
				$fields[$i][0] = null;
				$fields[$i][1] = 0;


				$fields[$i][0] = "*";
				$pos = $this->next_word_pos($query,$pos);

				$i++;
			}
			else
			{
				while (1)
				{					
					if ($this->next_word($query,$pos) == "`")
					{
						$fields[$i] = array();
						$fields[$i][0] = null;
						$fields[$i][1] = 0;

						$pos = $this->next_word_pos($query,$pos);
						$final = $this->final_pos($query,$pos,"`");
						
						if (substr($query,$pos,$final-$pos) == "*")
							$this->error_sintax($query,$pos);
						
						$field[$i][0] = substr($query,$pos,$final-$pos);
						$pos = $final + 1;

						$i++;
					}
					else
					{
						if ($this->next_word($query,$pos) == "*")
							$this->error_sintax($query,$pos);

						if (strtoupper($this->next_word($query,$pos)) == "DISTINCT")
						{
							$pos = $this->next_word_pos($query,$pos);
							if ($this->next_word($query,$pos) == "(")
							{
								$pos = $this->next_word_pos($query,$pos);

								while (1)
								{
									$fields[$i] = array();
									$fields[$i][0] = null;
									$fields[$i][1] = 0;

									if ($this->next_word($query,$pos) == "`")
									{
										$pos = $this->next_word_pos($query,$pos);
										$final = $this->final_pos($query,$pos,"`");
										$field[$i][0] = substr($query,$pos,$final-$pos);
										$pos = $final + 1;
									}
									else
									{
										$field[$i][0] = $this->next_word($query,$pos);
										$pos = $this->next_word_pos($query,$pos);
									}

									$field[$i][1] = 1;
//									$fields .= $field . "|distinct,";
									$i++;
									
									if ($this->next_word($query,$pos) == ",")
									{
										$pos = $this->next_word_pos($query,$pos);
									}
									else
										break;
								}
								if ($this->next_word($query,$pos) != ")")
									$this->error_sintax($query,$pos);
								else
									$pos = $this->next_word_pos($query,$pos);
							}
							else
							{
								$fields[$i] = array();
								$fields[$i][0] = null;
								$fields[$i][1] = 0;

								if ($this->next_word($query,$pos) == "`")
								{
									$pos = $this->next_word_pos($query,$pos);
									$final = $this->final_pos($query,$pos,"`");
									$fields[$i][0] = substr($query,$pos,$final-$pos);
									$pos = $final + 1;
								}
								else
								{
									$fields[$i][0] = $this->next_word($query,$pos);
									$pos = $this->next_word_pos($query,$pos);
								}
								$fields[$i][1] = 1;
//								$fields .= $field."|distinct,";
								$i++;
							}
						}
						else
						{
							$fields[$i] = array();
							$fields[$i][0] = null;
							$fields[$i][1] = 0;

							$fields[$i][0] = $this->next_word($query,$pos);
							$pos = $this->next_word_pos($query,$pos);

							$i++;;
						}
					}

					if ($this->next_word($query,$pos) == ",")
					{
						$pos = $this->next_word_pos($query,$pos);
					}
					else
						break;
				}
				
//				$fields = substr($fields,0,strlen($fields)-1);
			}
//			//echo "campos: "."<br>\n";
	//////print_r($fields);

			// Detects the table

			if (strtoupper($this->next_word($query,$pos)) != "FROM")
				$this->error_sintax($query,$pos);

			else
			{
				$pos = $this->next_word_pos($query,$pos);
				
				if ($this->next_word($query,$pos) == "`")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"`");
					$table = substr($query,$pos,$final-$pos);
					$pos = $final + 1;
				}
				else
				{		
					$table = $this->next_word($query,$pos);
					$pos = $this->next_word_pos($query,$pos);
				}
				//echo "tabela: ".$table."<br>\n";
			}

			// Prepare the peripherals
				$where = null;
				$where2 = null;
				$order = null;
				$limit = null;

			while (1)
			{
				$word = $this->next_word($query,$pos);

				if (strtoupper($word) == "WHERE")
				{//echo "<font color=#FF0000>WHERE detectado</font><br>\n";
					$pos = $this->next_word_pos($query,$pos);
					$array = $this->make_where($query,$pos);
					$where = $array[0];
					$pos = $array[1];
					$where2 = $array[2];
					//echo "output where: ".$where."<br>\n";
				}
				elseif (strtoupper($word) == "ORDER")
				{//echo "<font color=#FF0000>ORDER detectado</font><br>\n";
					$pos = $this->next_word_pos($query,$pos);
					$array = $this->make_order($query,$pos);
					$order = $array[0];
					$list = $array[0];
					$pos = $array[1];
					//echo "ordem: ".$list."<br>\n";
				}
				elseif (strtoupper($word) == "LIMIT")
				{//echo "<font color=#FF0000>LIMIT detectado</font><br>\n";
					$pos = $this->next_word_pos($query,$pos);
					$array = $this->make_limit($query,$pos);
					$limit = array($array[0],$array[1]);
					$first = $array[0];
					$second = $array[1];
					$pos = $array[2];
					//echo "início: ".$first.", final: ".$second."<br>\n";
				}
				elseif (!$word)
					break;
				elseif ($word == ";")
					break;
				else
				{
					$pos = $this->next_word_pos($query,$pos);
					$this->error_sintax($query,$pos);
					break;
				}
			}
			
			//echo "\n";
			$ret = $this->_select($fields,$table,$where,$where2,$order,$limit);
			unset($fields,$table,$where,$where2,$order,$limit);
			//echo "<br>\n";
		}

		// Prepare for INSERT
		
		elseif (strtoupper($word) == "INSERT")
		{//echo "tipo: ".$word."<br>\n";
			if (strtoupper($this->next_word($query,$pos)) != "INTO")
				$this->error_sintax($query,$pos);
				
			$pos = $this->next_word_pos($query,$pos);
			
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$table = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$table = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}		
			
			//echo "tabela: ".$table."<br>\n";
						
			if (strtoupper($this->next_word($query,$pos)) != "VALUES")
				$this->error_sintax($query,$pos);

			$pos = $this->next_word_pos($query,$pos);
			$content = array();
			$i = (int)0;

			while (1)
			{
				if ($this->next_word($query,$pos) != "(")
					$this->error_sintax($query,$pos);
	
				$pos = $this->next_word_pos($query,$pos);
				$content[$i] = array();
				
				while (1)
				{
					if ($this->next_word($query,$pos) == "'")
					{
						$pos = $this->next_word_pos($query,$pos);

						$final = $this->final_pos($query,$pos,"'");
						$content[$i][] = substr($query,$pos,$final-$pos);
						$pos = $final + 1;
						////echo substr($query,$pos);exit;
					}
					else
					{
						if (strtoupper($this->next_word($query,$pos)) == "NULL")
						{
							$content[$i][] = null;
							$pos = $this->next_word_pos($query,$pos);
						}
						elseif (!is_numeric($this->next_word($query,$pos)))
							$this->error_sintax($query,$pos);
						else
						{		
							$content[$i][] = $this->next_word($query,$pos);
							$pos = $this->next_word_pos($query,$pos);
						}
					}
					
					if ($this->next_word($query,$pos) == ",")
					{
						$pos = $this->next_word_pos($query,$pos);
					}
					else
					{
						$i++;
						break;
					}
				}
				if ($this->next_word($query,$pos) != ")")
					$this->error_sintax($query,$pos);
				$pos = $this->next_word_pos($query,$pos);

				if ($this->next_word($query,$pos) == ",")
					$pos = $this->next_word_pos($query,$pos);
				else
					break;
			}
			$ret = $this->_insert($table,$content);
			//////print_r($content);//echo "<br><br>\n\n";
			unset($table,$content);
		}

		// Prepare for DELETE
		
		elseif (strtoupper($word) == "DELETE")
		{//echo "tipo: ".$word."<br>\n";
			if (strtoupper($this->next_word($query,$pos)) != "FROM")
				$this->error_sintax($query,$pos);
				
			$pos = $this->next_word_pos($query,$pos);

			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$table = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$table = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}
			
			//echo "tabela: ".$table."<br>\n";
			
			if (strtoupper($this->next_word($query,$pos)) == "WHERE")
			{//echo "<font color=#FF0000>WHERE detectado</font><br>\n";
				$pos = $this->next_word_pos($query,$pos);
				$array = $this->make_where($query,$pos);
				$where = $array[0];
				$pos = $array[1];
				$where2 = $array[2];
				//echo "output where: ".$where."<br>";
			}
			elseif (!$this->next_word($query,$pos))
			{
				$where = null;
				$where2 = null;
			}
			else
				$this->error_sintax($query,$pos);

			$ret = $this->_delete($table,$where,$where2);
			unset($table,$where,$where2);
			//echo "<br><br>\n\n";
		}

		// Prepare for UPDATE
		
		elseif (strtoupper($word) == "UPDATE")
		{
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$table = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$table = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}
			
			//echo "tabela: ".$table."<br>\n";

			if (strtoupper($this->next_word($query,$pos)) != "SET")
				$this->error_sintax($query,$pos);

			$pos = $this->next_word_pos($query,$pos);

			$updates = array();
			$i = 0;

			while (1)
			{
				if ($this->next_word($query,$pos) == "`")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"`");
					$updates[$i][0] = substr($query,$pos,$final-$pos);
					$pos = $final + 1;
				}
				else
				{		
					$updates[$i][0] = $this->next_word($query,$pos);
					$pos = $this->next_word_pos($query,$pos);
				}
				
				if ($this->next_word($query,$pos) != "=")
					$this->error_sintax($query,$pos);
	
				$pos = $this->next_word_pos($query,$pos);
	
				if ($this->next_word($query,$pos) == "'")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"'");
					$updates[$i][1] = substr($query,$pos,$final-$pos);
					$pos = $final + 1;
				}
				else
				{
					$updates[$i][1] = $this->next_word($query,$pos);
						
					if (strtoupper($updates[$i][1]) == "NULL")
						$updates[$i][1] = null;
					elseif (!is_numeric($updates[$i][1]))
						$this->error_sintax($query,$pos);

					$pos = $this->next_word_pos($query,$pos);
				}
				
				if ($this->next_word($query,$pos) == ",")
					$pos = $this->next_word_pos($query,$pos);
				else
					break;
				$i++;
			}

			if (strtoupper($this->next_word($query,$pos)) == "WHERE")
			{//echo "<font color=#FF0000>WHERE detectado</font><br>\n";
				$pos = $this->next_word_pos($query,$pos);
				$array = $this->make_where($query,$pos);
				$where = $array[0];
				$pos = $array[1];
				$where2 = $array[2];
				//echo "output where: ".$where."<br>";
			}		
			elseif (!$this->next_word($query,$pos))
				$where = null;
			else
				$this->error_sintax($query,$pos);

			$ret = $this->_update($table,$updates,$where,$where2);
			//print_r($updates);//echo "<br><br>\n\n";
			unset($updates,$where,$where2);
		}

		// Prepare for CREATE TABLE
		
		elseif (strtoupper($word) == "CREATE" && strtoupper($this->next_word($query,$pos)) == "TABLE")
		{
			$pos = $this->next_word_pos($query,$pos);
			$content = array();
			$z = 0;
			
			while (1)
			{
				$content[$z] = array();
				
				if ($this->next_word($query,$pos) == "`")
				{
					$pos = $this->next_word_pos($query,$pos);
					$final = $this->final_pos($query,$pos,"`");
					$content[$z][0] = substr($query,$pos,$final-$pos); // gets table name
					$pos = $final + 1;
				}
				else
				{		
					$content[$z][0] = $this->next_word($query,$pos); // gets table name
					$pos = $this->next_word_pos($query,$pos);
				}
	
//				//echo "Tabela: ".$content[$z][0]."<br>\n";
				
				if ($this->next_word($query,$pos) != "(")
					$this->error_sintax($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
				
/*				if (strtoupper($this->next_word($query,$pos)) == "PRIMARY")
				{
				}*/
				//else
				//{

				$content[$z][1] = array();
				$i = 1;
				
					while (1)
					{
						$content[$z][$i] = array();
						
						if ($this->next_word($query,$pos) == "`")
						{
							$pos = $this->next_word_pos($query,$pos);
							$final = $this->final_pos($query,$pos,"`");
							$content[$z][$i][0] = substr($query,$pos,$final-$pos); // gets field name
							$pos = $final + 1;
						}
						else
						{
							$content[$z][$i][0] = $this->next_word($query,$pos); // gets field name
							$pos = $this->next_word_pos($query,$pos);
						}

						$content[$z][$i][1] = null; // type
						$content[$z][$i][2] = null; // size
						$content[$z][$i][3] = 0; // 0 to not null / 1 to null
						$content[$z][$i][4] = 0; // 1 to auto_incrment
						$content[$z][$i][5] = 0; // 1 to key
						$content[$z][$i][6] = null; // default
				
////echo "--- <strong>".$content[$z][$i][0]."</strong><br>\n";
						while (1)
						{
							$word = $this->next_word($query,$pos);
													
							if (strtoupper($word) == "INT" || strtoupper($word) == "FLOAT" || strtoupper($word) == "CHAR")
							{
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][1] = strtolower($word); // gets type of field

//								//echo "------ Tipo:".$content[$z][$i][1]."<br>\n";

//								//echo "------ Tamanho:".$content[$z][$i][2]."<br>\n";
							}
							elseif ($this->next_word($query,$pos) == "(")
							{
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][2] = $this->next_word($query,$pos); // gets the limit

								if (!is_numeric($content[$z][$i][2]) && eregi("\.",$content[$z][$i][2]))
									$this->error_sintax($query,$pos);
									
								$pos = $this->next_word_pos($query,$pos);

								if ($this->next_word($query,$pos) != ")")
									$this->error_sintax($query,$pos);

								$pos = $this->next_word_pos($query,$pos);
							}
							elseif (strtoupper($word) == "NULL")
							{
//								//echo "------ ".$word."<br>\n";
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][3] = 1; // is null
							}
							elseif (strtoupper($word) == "AUTO_INCREMENT")
							{
//								//echo "------ ".$word."<br>\n";
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][4] = 1; // is auto_increment
							}
							elseif (strtoupper($word) == "KEY")
							{
//								//echo "------ ".$word."<br>\n";
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][5] = 1; // is key
							}
							elseif (strtoupper($word) == "NOT" && strtoupper($this->next_word($query,$this->next_word_pos($query,$pos))) == "NULL")
							{
//								//echo "------ ".$word." ".$this->next_word($query,$this->next_word_pos($query,$pos))."<br>\n";
								$pos = $this->next_word_pos($query,$pos);
								$pos = $this->next_word_pos($query,$pos);
								$content[$z][$i][3] = 0; // is not null
							}
							elseif (strtoupper($word) == "DEFAULT")
							{
								$pos = $this->next_word_pos($query,$pos);
								
								if ($this->next_word($query,$pos) == "'")
								{
									$pos = $this->next_word_pos($query,$pos);
									$final = $this->final_pos($query,$pos,"'");
									$content[$z][$i][6] = substr($query,$pos,$final-$pos);
									$pos = $final + 1;
								}
								else
								{
									$content[$z][$i][6] = $this->next_word($query,$pos);
									$pos = $this->next_word_pos($query,$pos);
								}
								//echo "------  Default: ".$content[$z][$i][6]."<br>\n";
							}
							elseif ($word == "," || $word == ")")
							{
								break;
							}
							else
								$this->error_sintax($query,$pos);
						} // end atributes loop
					
						$word = $this->next_word($query,$pos);
						$pos = $this->next_word_pos($query,$pos);
						
					//	if ($word == ",")
					//	{
					//		continue;
					//	}
						if ($word == ")")
						{
							break;
						}
						$i++;
					} // end fields loop
				//}

				if ($this->next_word($query,$pos) == ",")
				{
					$pos = $this->next_word_pos($query,$pos);
				}
				else
				{
					break;
				}

				$z++;
			} // end tables loop
			$ret = $this->_create_tb($content);

			////print_r($content);
			unset($content);
		}
		
		// Prepare for CREATE DATABASE
		
		elseif (strtoupper($word) == "CREATE" && strtoupper($this->next_word($query,$pos)) == "DATABASE")
		{
			$pos = $this->next_word_pos($query,$pos);
			
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$db = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$db = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}
		
			$ret = $this->_db_create($db);
			unset($db);
		}

		// Prepare for DROP DATABASE
		
		elseif (strtoupper($word) == "DROP" && strtoupper($this->next_word($query,$pos)) == "DATABASE")
		{
			$pos = $this->next_word_pos($query,$pos);
			
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$db = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$db = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}
		
			$ret = $this->_db_drop($db);
			unset($db);
		}

		// Prepare for DROP TABLE
		
		elseif (strtoupper($word) == "DROP" && strtoupper($this->next_word($query,$pos)) == "TABLE")
		{
			$pos = $this->next_word_pos($query,$pos);
			
			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$tb = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$tb = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}
		
			$ret = $this->_drop_tb($tb);
			unset($tb);
		}

		// Prepare for LIST DATABASES
		
		elseif (strtoupper($word) == "LIST" && strtoupper($this->next_word($query,$pos)) == "DATABASES")
		{
			$pos = $this->next_word_pos($query,$pos);
			$ret = $this->_list_dbs();
		}

		// Prepare for LIST TABLES
		
		elseif (strtoupper($word) == "LIST" && strtoupper($this->next_word($query,$pos)) == "TABLES")
		{
			$pos = $this->next_word_pos($query,$pos);
			$ret = $this->_list_tbs();
		}

		// Prepare for LIST FIELDS
		
		elseif (strtoupper($word) == "LIST" && strtoupper($this->next_word($query,$pos)) == "FIELDS")
		{
			$pos = $this->next_word_pos($query,$pos);
			
			if (strtoupper($this->next_word($query,$pos)) != "OF")
				$this->error_sintax($query,$pos);
			$pos = $this->next_word_pos($query,$pos);

			if (strtoupper($this->next_word($query,$pos)) != "TABLE")
				$this->error_sintax($query,$pos);
			$pos = $this->next_word_pos($query,$pos);

			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$tb = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$tb = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}

			$ret = $this->_list_fields($tb);
			unset($tb);
		}

		// Prepare for SHOW CREATE
		
		elseif (strtoupper($word) == "SHOW" && strtoupper($this->next_word($query,$pos)) == "CREATE")
		{
			$pos = $this->next_word_pos($query,$pos);
			
			if (strtoupper($this->next_word($query,$pos)) != "TABLE")
				$this->error_sintax($query,$pos);
			$pos = $this->next_word_pos($query,$pos);

			if ($this->next_word($query,$pos) == "`")
			{
				$pos = $this->next_word_pos($query,$pos);
				$final = $this->final_pos($query,$pos,"`");
				$tb = substr($query,$pos,$final-$pos);
				$pos = $final + 1;
			}
			else
			{		
				$tb = $this->next_word($query,$pos);
				$pos = $this->next_word_pos($query,$pos);
			}

			$ret = $this->_show_create_tb($tb);
			unset($tb);
		}

		elseif ($word == ";")
		{
			continue;
		}
		elseif ($word == "-" && $this->next_word($query,$pos) == "-")
		{
			$pos = $this->next_word_pos($query,$pos);
			$final = $this->final_pos($query,$pos,"\n");
			$pos = $final + 1;
		}
		elseif (!$word)
			break;
		else
			$this->error_sintax($query,$pos);
	}
	return $ret;
 }
} //end class

?>
