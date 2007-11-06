<?php 
	require("base.php");
	class App extends Base
	{
		var $id;
		var $name;
		var $author;
		var $email;
		var $code;
		var $version;
		var $maturity;
		var $category;
		var $_tablename = "apps";
		
		function _makeModel($line)
		{
			$p = new App();
			$p->id = $line['ID'];
			$p->name = $line['name'];
			$p->author = $line['author'];
			$p->email = $line['email'];
			$p->code = $line['code'];
			$p->version = $line['version'];
			$p->maturity = $line['maturity'];
			$p->category = $line['category'];
			return $p;
		}
		
		function _make_mysql_update_query($table)
		{
			$id=$this->id;
			$username = mysql_real_escape_string($this->username);
			$password = mysql_real_escape_string($this->password);
			$level = mysql_real_escape_string($this->level);
			$logged = $this->logged;
			$email = mysql_real_escape_string($this->email);
			$query = "UPDATE ${table} SET username='${username}', email='${email}', password = '${password}', level='${level}', logged=${logged} WHERE ID=${id} LIMIT 1";
		}
		function _make_mysql_insert_query($table)
		{
			$username = mysql_real_escape_string($this->username);
			$password = mysql_real_escape_string($this->password);
			$level = mysql_real_escape_string($this->level);
			$logged = $this->logged;
			$email = mysql_real_escape_string($this->email);
			$query = "INSERT INTO ${table} SET username='${username}', email='${email}', password = '${password}', level='${level}', logged=${logged}";
		}
		
	}
	$App = new App();
?>