<?php
error_reporting(0);
//get rid of magicquotes
if (get_magic_quotes_gpc())
{
	foreach($_POST as $key => $value)
	{
		$_POST[$key] = stripslashes($value);
	}
}
if (get_magic_quotes_gpc())
{
	foreach($_GET as $key => $value)
	{
		$_GET[$key] = stripslashes($value);
	}
}
?>