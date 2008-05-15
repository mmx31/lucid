<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Quota extends Base
	{
		var $type = array('type' => 'text');
		var $size = array('type' => 'integer', 'default' => 0);
	}
	global $Quota;
	$Quota = new Quota();
?>