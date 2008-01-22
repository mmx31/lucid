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
	$u = $User->get_current();
	if(!$u->has_permission("api.mail")) internal_error("permission_denied");
	if($_GET['section'] == "in") {
		$protocol = $_POST['protocol'];
		if($protocol == "IMAP") import('lib.mail.imap');
		else import('lib.mail.pop3');
		$con = iil_Connect($_POST['host'], $_POST['username'], $_POST['password']);
		if($con === false) internal_error("mail_connect_err", $iil_error);
		
		
		if($_GET['action'] == "listMailboxes") {
			$p = new jsonOutput();
			$p->set(iil_C_ListMailboxes($con, $_POST['rootdir'] ? $_POST['rootdir'] : "/", "*"));
		}
		if($_GET['action'] == "listSubscribed") {
			$p = new jsonOutput();
			$p->set(iil_C_ListSubscribed($con, $_POST['rootdir'] ? $_POST['rootdir'] : "/", "*"));
		}
		if($_GET['action'] == "getQuota") {
			$p = new jsonOutput();
			$p->set(iil_C_GetQuota($con));
		}
		if($_GET['action'] == "countMessages") {
			$p = new jsonOutput();
			$mailboxes = iil_C_ListMailboxes($con, $_POST['rootdir'] ? $_POST['rootdir'] : "/", "*");
			foreach($mailboxes as $mailbox) {
				if($_POST['flag'] == "UNSEEN") $p->append($mailbox, iil_C_CountUnseen($con, $mailbox));
				else $p->append($mailbox, iil_C_CountMessages($con, $mailbox));
			}
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
		if($_GET['action'] == "listFolder") {
			$list = iil_C_FetchHeaders($con, $_POST['mailbox'], $_POST['start'] . ":" . $_POST['end']);
			$out = new jsonOutput();
			//we need to optimize this so we don't send too much over the wire
			$listout = array();
			foreach($list as $key => $value) {
				$listout[$key] = array();
				foreach(array("id", "uid", "to", "from", "subject", "answered") as $header) {
					$listout[(int) $key][$header] = $value->$header;
				}
			}
			$out->set($listout);
		}
		
		iil_Close($con);
	}
	if($_GET['section'] == "out") {
		import("lib.mail.stmp");
	}
?>