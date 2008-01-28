<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychiccyberfreak

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
require("../lib/includes.php");
import("models.user");
$user = $User->get_current();

if($GLOBALS['conf']['xsite'] && $user->has_permission("api.xsite"))
{
	// Get the REST call path from the AJAX application
	// Is it a POST or a GET?
	$url = ($_POST['path']) ? $_POST['path'] : $_GET['path'];
	// Is Curl on this server?
	if (!function_exists('curl_init')) { internal_error("feature_not_available"); }
	// Open the Curl session
	$session = curl_init($url);
	
	// If it's a POST, put the POST data in the body
	if ($_POST['path']) {
		$postvars = '';
		while ($element = current($_POST)) {
			$postvars .= key($_POST).'='.$element.'&';
			next($_POST);
		}
		curl_setopt ($session, CURLOPT_POST, true);
		curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
	}
	
	curl_setopt($session, CURLOPT_HEADER, true);
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	
	// Make the call
	$xml = curl_exec($session);
	
	echo $xml;
	curl_close($session);
}
else {
	internal_error("permission_denied");
}
?>