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
	if(!isset($GLOBALS['path'])) {
		$path = dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR;
	    $GLOBALS['path'] = $path;
	}
	@include("MDB2.php");
	$includes = array(
		"configuration.php",
		(class_exists(MDB2) ? null : "lib/MDB2.php"),
		"lib/util.php",
		"lib/output.php",
		"models/base.php"
	);
	foreach($includes as $include)
	{
		if(!is_null($include)) require_once($GLOBALS['path'] . $include);
	}
?>
