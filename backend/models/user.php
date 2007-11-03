<?php 
	require("base.php");
	class User extends Base
	{
		var $id;
		var $username;
		var $password;
		var $logged;
		var $email;
		var $level;
		function get($id)
		{
			require("../config.php");
			$link = mysql_connect($db_host, $db_username, $db_password)
			   or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$query = "SELECT * FROM ${db_prefix}users WHERE ID='${id}' LIMIT 1";
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
			if($line)
			{
				$p = new User();
				$p->id = $line['ID'];
				$p->username = $line['username'];
				$p->logged = $line['logged'];
				$p->password = $line['password'];
				$p->email = $line['email'];
				$p->level = $line['level'];
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
			require("../config.php");
			$link = mysql_connect($db_host, $db_username, $db_password)
			   or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$feild = mysql_real_escape_string($feild);
			$value = mysql_real_escape_string($value);
			$query = "SELECT * FROM ${db_prefix}users WHERE ${feild}='${value}'";
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
			$list = Array();
			while($line = mysql_fetch_array($result, MYSQL_ASSOC))
			{
				$p = new User();
				$p->id = $line['ID'];
				$p->username = $line['username'];
				$p->logged = $line['logged'];
				$p->password = $line['password'];
				$p->email = $line['email'];
				$p->level = $line['level'];
				$list.push($p);
			}
			mysql_free_result($result);
			mysql_close($link);
			if(!isset($line)) { return false; }
			else { return $list; }
		}
		function get_current()
		{
			if(isset($_SESSION['userid']))
			{
				return $this->get($_SESSION['userid']);
			}
			else
			{
				return False;
			}
		}
		function save()
		{
			require("../config.php");
			$link = mysql_connect($db_host, $db_username, $db_password)
			   or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			if(isset($this->id))
			{
				$id=$this->id;
				$username = mysql_real_escape_string($this->username);
				$password = mysql_real_escape_string($this->password);
				$level = mysql_real_escape_string($this->level);
				$logged = $this->logged;
				$email = mysql_real_escape_string($this->email);
				$query = "UPDATE ${db_prefix}users SET username='${username}', email='${email}', password = '${password}', level='${level}', logged=${logged} WHERE ID=${id} LIMIT 1";
				mysql_query($query) or die('Query failed: ' . mysql_error());
			}
			else
			{
				$username = mysql_real_escape_string($this->username);
				$password = mysql_real_escape_string($this->password);
				$level = mysql_real_escape_string($this->level);
				$logged = $this->logged;
				$email = mysql_real_escape_string($this->email);
				$query = "INSERT INTO ${db_prefix}users SET username='${username}', email='${email}', password = '${password}', level='${level}', logged=${logged}";
				mysql_query($query) or die('Query failed: ' . mysql_error());
			}
			mysql_close($link);
		}
		function authenticate($user, $pass)
		{
			require("../config.php");
			$link2 = mysql_connect($db_host, $db_username, $db_password)
			   or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$query = "SELECT * FROM ${db_prefix}users WHERE username='${user}' LIMIT 1";
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
			if($line)
			{
				$pass = crypt($pass, $conf_secretword);
				if($line["password"] == $pass)
				{
					$p = $this->get($line['ID']);
					mysql_free_result($result);
					//mysql_close($link2);
					return $p;
				}
				else
				{
					mysql_free_result($result);
					//mysql_close($link2);
					return false;
				}
			}
			else
			{
				mysql_free_result($result);
				//mysql_close($link2);
				return false;
			}
		}
		function login()
		{
			$_SESSION['userid'] = $this->id;
			$_SESSION['username'] = $this->username;
			$_SESSION['userlevel'] = $this->level;
			$_SESSION['userloggedin'] = TRUE;
			$this->logged = 1;
			$this->make_userdir();
			$this->save();
		}
		function logout()
		{
			$_SESSION['userid'] = null;
			$_SESSION['username'] = null;
			$_SESSION['userlevel'] = null;
			$_SESSION['userloggedin'] = FALSE;
			$this->logged = 0;
			$this->save();
		}
		function make_userdir()
		{
			if(!is_dir("../../files/".$_SESSION['username'])){
				//Create user environment for first time
				mkdir("../../files/".$this->username);
				mkdir("../../files/".$this->username."/Documents");
				$ourFileName = "../../files/".$this->username."/welcome.txt";
				$ourFileHandle = fopen($ourFileName, 'w') or die("1");
				fwrite($ourFileHandle, "Welcome to Psych Desktop, ".$this->username."\r\n Your new account is installed and ready.");
				fclose($ourFileHandle);
			}
		}
		function set_password($pass)
		{
			require("../config.php");
			$this->password = crypt($pass, $conf_secretword);
		}
		function generate_password()
		{
			$characters = 10;
			$possible = '23456789bcdfghjkmnpqrstvwxyz'; 
			$code = '';
			$i = 0;
			while ($i < $characters) { 
				$code .= substr($possible, mt_rand(0, strlen($possible)-1), 1);
				$i++;
			}
			$this->set_password($code);
			return $code;
		}
	}
	$User = new User();
?>