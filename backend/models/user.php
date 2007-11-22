<?php 
	if(!$Base) require("base.php");
	class User extends Base
	{
		var $id;
		var $username;
		var $password;
		var $logged;
		var $email;
		var $level;
		var $_tablename = "users";
		function get_current()
		{
			if(isset($_SESSION['userid']))
			{
				return $this->get($_SESSION['userid']);
			}
			else
			{
				return FALSE;
			}
		}
		function authenticate($user, $pass)
		{
			$line = self::filter("username", $user);
			if($line != FALSE)
			{
				require("../config.php");
				$pass = crypt($pass, $conf_secretword);
				if($line[0]->password == $pass)
				{
					return $this->_make_model($line[0]);
				}
				else
				{
					return FALSE;
				}
			}
			else
			{
				return FALSE;
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