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
	class App extends Base
	{
		var $name = array('type' => "text");
		var $author = array('type' => "text");
		var $email = array('type' => "text");
		var $code = array('type' => "text");
		var $version = array('type' => "text");
		var $maturity = array('type' => "text");
		var $category = array('type' => "text");
		var $filetypes = array('type' => "array");
	}
	global $App;
	$App = new App();
?>