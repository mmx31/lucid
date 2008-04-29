<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Config extends Base
	{
		var $userid = array('type' => 'integer', 'length' => 11);
		var $value = array('type' => 'text');
	}
	global $Config;
	$Config = new Config();