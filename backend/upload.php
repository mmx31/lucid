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
//TODO: In the future we should make the filename a random name, and then check if it exists. If it does, generate a new name and go back to the begining
//TODO: make this for dojo.io.iframe
session_start();
	require("config.php");
if(!isset($_SESSION['userid'])) {
die("Access denied. Your session has expired.");
}
if(isset($_FILES['uploadedfile']['name'])) {
$target_path = '../files/'.$_SESSION['username'].'/'.$_POST['uploadedir'];
$target_path = $target_path . basename( $_FILES['uploadedfile']['name']); 
if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $target_path)) {
	echo "The file '".  basename( $_FILES['uploadedfile']['name']). 
    "' has been uploaded to your Psych Desktop :)<br> Upload another file? <p>";
} else{
    echo "There was an error uploading the file, please try again! Remember: there are size limitations.";
}
}
?>
<form enctype="multipart/form-data" action="upload.php" method="POST">
Choose a file to upload: <input name="uploadedfile" type="file" /><br />
Path to place the file in: <input name="uploadedir" type="text" value="/" /><br />
<input type="submit" value="Upload File to Psych Desktop" />
</form>