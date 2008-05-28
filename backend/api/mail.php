<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


	require("../lib/includes.php");
	import("models.user");
	$u = $User->get_current();
	if(!$u->has_permission("api.mail")) internal_error("permission_denied");
	if($_GET['section'] == "send") {
		
	}
	if($_GET['section'] == "receive") {
		
	}