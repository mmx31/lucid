<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Auth extends Base
	{
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appid = array('type' => 'integer', 'length' => 11);
		var $server = array('type' => 'text');
		var $username = array('type' => 'text');
		var $password = array('type' => 'blob');
	}
	global $Auth;
	$Auth = new Auth();