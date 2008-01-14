<?php
	/*
	    Psych Desktop
	    Copyright (C) 2006 Psychiccyberfreak
	
	    This program is free software; you can redistribute it and/or modify
	    it under the terms of the GNU General Public License as published by
	    the Free Software Foundation; version 2 of the License.
	
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
	$u = $User->getCurrent();
	if(!$u->has_permission("api.mail")) internal_error("permission_denied");
	if($_GET['section'] == "in") {
		$protocol = $POST['protocol'];
		if($protocol == 'IMAP') import('lib.imap');
		else import('lib.pop3');
		$con = iil_Connect($_POST['host'], $_POST['username'], $_POST['password']);
		if($con === false) internal_error("mail_connect_err");
		
		
		if($_GET['action'] == "listMailboxes") {
			$p = new jsonOutput();
			$p->set(iil_C_ListMailboxes($con));
		}
		if($_GET['action'] == "createFolder") {
			if($protocol != "IMAP") internal_error("feature_not_available");
			iil_C_CreateFolder($con, $_POST['folder']);
			$p = new intOutput();
			$p->set("ok");
		}
		if($_GET['action'] == "renameFolder") {
			if($protocol != "IMAP") internal_error("feature_not_available");
			iil_C_CreateFolder($con, $_POST['from'], $_POST['to']);
			$p = new intOutput();
			$p->set("ok");
		}
		if($_GET['action'] == "deleteFolder") {
			if($protocol != "IMAP") internal_error("feature_not_available");
			iil_C_DeleteFolder($con, $_POST['folder']);
			$p = new intOutput();
			$p->set("ok");
		}
		
		ill_Close($con);
	}
	if($_GET['section'] == "out") {
		import("lib.stmp");
	}
?>