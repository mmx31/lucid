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

if($user->has_permission("api.xsite"))
{
	$url = $_POST['path'];
	// Is Curl on this server?
	if (!function_exists('curl_init')) { internal_error("feature_not_available"); }
	// Open the Curl session
	$session = curl_init();
	curl_setopt($session, CURLOPT_URL,$url);
	curl_setopt($session, CURLOPT_FAILONERROR, 1);
	curl_setopt($session, CURLOPT_FOLLOWLOCATION, 1);// allow redirects 
	
	$postvars = '';
	while ($element = current($_POST)) {
		$postvars .= key($_POST).'='.$element.'&';
		next($_POST);
	}
	curl_setopt ($session, CURLOPT_POST, true);
	curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
	
	curl_setopt($session, CURLOPT_HEADER, false);
	curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	
	// Make the call
	$xml = curl_exec($session);
	
	//Print contentType header
	$type = curl_getinfo($session, CURLINFO_CONTENT_TYPE);
	header("Content-Type: $type");
	
	echo $xml;
	/*print_r(curl_getinfo($session)); 
echo "\n\ncURL error number:" .curl_errno($session); 
echo "\n\ncURL error:" . curl_error($session); */
	curl_close($session);
}
else {
	internal_error("permission_denied");
}
?>