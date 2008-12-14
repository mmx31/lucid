<?php 
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	class Session extends Base
	{
        var $session_id = array('type' => 'text', 'unique' => true);
        var $user_id = array('type' => 'text');
        var $date_created = array('type' => 'timestamp');
        var $last_updated = array('type' => 'timestamp');
        var $session_data = array('type' => 'text');
	}
	global $Session;
	$Session = new Session();
