<?php
/*
    Psych Desktop
    Copyright (C) 2006 Psychcf

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
import("models.config");
if($_GET['section'] == "check")
{
	if($_GET['action'] == "loggedin")
	{
		$cur = $User->get_current();
		$locale = "NONE";
		if($cur != false)
		{
			$conf = $Config->filter("userid", $cur->id);
			if($conf != false) {
				import("lib.Json.Json");
				$locale = Zend_Json::decode($conf[0]->value);
				$locale = $locale['locale'];
			}
		}
		setcookie("desktopLocale", $locale, 0, "/");
		$out = new intOutput($cur != false ? "ok" : "generic_err");
	}
}
?>