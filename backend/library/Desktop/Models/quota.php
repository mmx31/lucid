<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Desktop_Models_Quota extends Desktop_Models_Base
	{
		var $type = array('type' => 'text');
		var $size = array('type' => 'integer', 'default' => 0);
	}
	global $Desktop_Models_Quota;
	$Desktop_Models_Quota = new Desktop_Models_Quota();
?>