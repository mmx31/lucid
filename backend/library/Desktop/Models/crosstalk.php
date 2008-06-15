<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Desktop_Models_Crosstalk extends Desktop_Models_Base
	{
		var $sender = array('type' => 'integer', 'length' => 11);
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appid = array('type' => 'integer', 'length' => 11);
		var $args = array('type' => 'text');
		var $topic = array('type' => 'text');
		var $instance = array('type' => 'integer', 'length' => 11);
	}
	global $Desktop_Models_Crosstalk;
	$Desktop_Models_Crosstalk = new Desktop_Models_Crosstalk();