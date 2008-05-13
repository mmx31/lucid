<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Registry extends Base
	{
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appname = array('type' => 'text');
		var $name = array('type' => 'text');
		var $value = array('type' => 'text');
	}
	global $Registry;
	$Registry = new Registry();