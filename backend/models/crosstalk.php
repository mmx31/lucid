<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Crosstalk extends Base
	{
		var $sender = array('type' => 'integer', 'length' => 11);
		var $userid = array('type' => 'integer', 'length' => 11);
		var $appsysname = array('type' => 'text');
		var $args = array('type' => 'text');
		var $topic = array('type' => 'text');
		var $instance = array('type' => 'integer', 'length' => 11);
	}
	global $Crosstalk;
	$Crosstalk = new Crosstalk();