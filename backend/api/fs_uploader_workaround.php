<?php
$_GET['section'] = "io";
$_GET['action'] = "upload";

$res = array();
ereg("([a-zA-Z0-9]+)\?path\=(.+)", $_GET['vars'], $res);

session_name("desktop_session");
session_id($res[1]);
$_POST['path'] = $res[2];

require "./fs.php";
