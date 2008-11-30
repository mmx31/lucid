<?php
/*
	Copyright (c) 2004-2008, The Dojo Foundation & Lucid Contributors
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above.
*/


require("../lib/includes.php");
import("models.user");
if($_GET['section'] == "check")
{
	if($_GET['action'] == "loggedin")
	{
		$c = $User->get_current();
		$out = new intOutput($c !== false ? "ok" : "generic_err");
		if($c !== false) $c->writeLocaleCookie();
	}
    if($_GET['action'] == "getToken"){
        $token = md5(uniqid(rand()));
        $_SESSION['token'] = $token;
        $out = new jsonOutput(array(
            "token" => $token
        ));
    }
}
