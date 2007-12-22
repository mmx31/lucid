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
require("../configuration.php");
if($GLOBALS['conf']['xsite']) { die("<b>External Access is forbidden."); }
else {
	session_start();
	if($_SESSION['userloggedin'] == TRUE)	//very important, make sure the user is logged in
	{										//maybe in the future add this in the permissions system
		// Get the REST call path from the AJAX application
		// Is it a POST or a GET?
		$url = ($_POST['path']) ? $_POST['path'] : $_GET['path'];
		
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
		
		// Don't return HTTP headers. Do return the contents of the call
		curl_setopt($session, CURLOPT_HEADER, false);
		curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
		
		// Make the call
		$xml = curl_exec($session);
		
		// The web service returns XML. Set the Content-Type appropriately
		header("Content-Type: text/xml");
		
		echo $xml;
		curl_close($session);
	}
}
?>