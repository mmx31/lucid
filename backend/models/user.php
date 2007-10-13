<?php 
	require("base.php");
	class User extends Base
	{
		var $id;
		var $username;
		var $password;
		function get($id)
		{
			
		}
		function authenticate($user, $pass)
		{
			require("../config.php");
			$link = mysql_connect($db_host, $db_username, $db_password)
			   or die('Could not connect: ' . mysql_error());
			mysql_select_db($db_name) or die('Could not select database');
			$query = "SELECT * FROM ${db_prefix}users WHERE username='${user}' LIMIT 1";
			$result = mysql_query($query) or die('Query failed: ' . mysql_error());
			$line = mysql_fetch_array($result, MYSQL_ASSOC);
			$pass = crypt($pass, $conf_secretword);
			if($line)
			{
				if($line["password"] == $pass)
				{
					$p = new User();
					$p->id = $line['ID'];
					$p->username = $line['username'];
					$p->level = $line['level'];
					$p->login();
					$p->make_userdir();
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
			else
			{
				mysql_free_result($result);
				mysql_close($link);
				return false;
			}
		}
		function login()
		{
			$_SESSION['userid'] = $line['ID'];
			$_SESSION['username'] = $line['username'];
			$_SESSION['userlevel'] = $line['level'];
			$_SESSION['userloggedin'] = TRUE;
		}
		function make_userdir()
		{
			if(!is_dir("../files/".$_SESSION['username'])){
				//Create user environment for first time
				mkdir("../files/".$this->username);
				mkdir("../files/".$this->username."/Documents");
				$ourFileName = "../files/".$this->username."/welcome.txt";
				$ourFileHandle = fopen($ourFileName, 'w') or die("1");
				fwrite($ourFileHandle, "Welcome to Psych Desktop, ".$this->username."\r\n Your new account is installed and ready.");
				fclose($ourFileHandle);
			}
		}
	}
?>