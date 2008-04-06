<?php 
/*
    Psych Desktop
    Copyright (C) 2006 Psychcf

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; version 2 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
	class User extends Base
	{
		var $name = array('type' => 'text');
		var $username = array('type' => 'text');
		var $password = array('type' => 'text');
		var $logged = array('type' => 'integer', 'length' => 1, 'default' => 0);
		var $email = array('type' => 'text');
		var $permissions = array('type' => 'array');
		var $groups = array('type' => 'array');
		var $lastauth = array('type' => 'timestamp');
		
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
			$line = $this->filter("username", $user);
			if($line != FALSE)
			{
				$pass = crypt($pass, $GLOBALS['conf']['salt']);
				if($line[0]->password == $pass)
				{
					return $line[0];
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
			$_SESSION['userloggedin'] = TRUE;
			$this->logged = 1;
			$this->lastauth = date('Y-m-d H:i:s');
			$this->make_userdir();
			$this->writeLocaleCookie();
			$this->save();
		}
		function writeLocaleCookie() {
			import("models.config");
			global $Config;
			$locale = "NONE";
			$conf = $Config->filter("userid", $this->id);
			if($conf != false) {
				import("lib.Json.Json");
				$locale = Zend_Json::decode($conf[0]->value);
				$locale = $locale['locale'];
			}
			setcookie("desktopLocale", $locale, 0, dirname($GLOBALS['path']));
		}
		function logout()
		{
			$_SESSION['userid'] = null;
			$_SESSION['username'] = null;
			$_SESSION['userloggedin'] = FALSE;
			$this->logged = 0;
			$this->save();
		}
		function make_userdir()
		{
			$blah = $this->username;
			if(!is_dir("../../files/".$blah)){
				//Create user environment for first time
				mkdir("../../files/".$blah);
				mkdir("../../files/".$blah."/Documents");
				mkdir("../../files/".$blah."/Desktop");
				$ourFileName = "../../files/".$blah."/Desktop/welcome.txt";
				$ourFileHandle = fopen($ourFileName, 'w') or die("Could not open file");
				fwrite($ourFileHandle, "Welcome to Psych Desktop, ".$this->username."\r\n Your new account is installed and ready.");
				fclose($ourFileHandle);
			}
		}
		function cleanup() {
			$this->delete_userdir();
		}
		function delete_userdir()
		{
			$user = $this->username;
			if(is_dir("../../files/".$user)) {
				$this->_deltree("../../files/".$user);
			}
		}
		function _deltree($f)
		{
			if( is_dir( $f ) ){
				foreach( scandir( $f ) as $item ){
					if( !strcmp( $item, '.' ) || !strcmp( $item, '..' ) )
						continue;       
					$this->_deltree( $f . "/" . $item );
				}   
				rmdir( $f );
			}
			else{
				unlink( $f );
			}
		}
		function set_password($pass)
		{
			$this->password = crypt($pass, $GLOBALS['conf']['salt']);
		}
		function crypt_password()
		{
			$this->password = crypt($this->password, $GLOBALS['conf']['salt']);
		}
		function check_password($provided)
		{
			return $this->password == crypt($this->password, $GLOBALS['conf']['salt']);
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
		function clear_permission($perm) {
			unset($this->permissions[$perm]);
		}
		function remove_permission($perm) {
			$this->permissions[$perm] = false;
		}
		function has_permission($perm) {
			global $Group;
			$myPerms = $this->permissions;
			if(isset($myPerms[$perm]) && !is_null($myPerms[$perm])) {
				return $myPerms[$perm];
			}
			$groupPerms = array();
			if(!empty($this->groups)) {
				import("models.group");
				$allowed = null;
				foreach($this->groups as $group) {
					$g = $Group->filter("name", $group);
					if($g !== false) {
						$allowed = $g[0]->has_permission($perm);
						if($allowed === false) return false;
					}
				}
				if($allowed != null) return true;
			}
			//fallback on the default
			import("models.permission");
			global $Permission;
			$p = $Permission->filter("name", $perm);
			if($p == false) return false;
			return $p[0]->initial;
		}
		function add_permission($perm) {
			$this->permissions[$perm] = true;
		}
	}
	global $User;
	$User = new User();
?>
