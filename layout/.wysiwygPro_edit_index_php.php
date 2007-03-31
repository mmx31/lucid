<?php ob_start() ?>
<?php
if ($_GET['randomId'] != "N7HBftoxhvseGJ4Ixdd5bm9_BOTY_4RLV_HQB9DiYMxq1EDVsSvulBgkH8x5QuhUP14zmITI0j5BOoIt4OyHHUrpxQASAx075M1F5UU8gp4zh3OkZwySSY10Qei3ih_bbzLAvzxKspKHYR6oLaqNVJ9bHNHM5IYJelKXttoi5dTvSH5tADD6P2YNtBazM0Pfl_iLAJOj9HG9yqa9vBDVzecHBUMwAGVmrVekNCO16ETngsWbOyelpqZcg33Xa3BY") {
    echo "Access Denied";
    exit();
}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Editing index.php</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">body {background-color:threedface; border: 0px 0px; padding: 0px 0px; margin: 0px 0px}</style>
</head>
<body>
<div align="center">
<script language="javascript">
<!--//
// this function updates the code in the textarea and then closes this window
function do_save() {
	var code =  htmlCode.getCode();
	document.open();
	document.write('<html><form METHOD="POST" name=mform action="http://www.psychdesigns.net:2082/frontend/rvblue/files/savehtmlfile.html"><input type="hidden" name="dir" value="/home/psych/public_html/desktop/desktop"><input type="hidden" name="file" value="index.php">Saving&nbsp;....<br /><br ><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><textarea name=page rows=1 cols=1></textarea></form></html>');
	document.close();
	document.mform.page.value = code;
	document.mform.submit();
}
function do_abort() {
	var code =  htmlCode.getCode();
	document.open();
	document.write('<html><form METHOD="POST" name="mform" action="http://www.psychdesigns.net:2082/frontend/rvblue/files/aborthtmlfile.html"><input type="hidden" name="dir" value="/home/psych/public_html/desktop/desktop"><input type="hidden" name="file" value="index.php">Aborting Edit&nbsp;....</form></html>');
	document.close();
	document.mform.submit();
}
//-->
</script>
<?php
// make sure these includes point correctly:
include_once ('/usr/local/cpanel/base/3rdparty/WysiwygPro/editor_files/config.php');
include_once ('/usr/local/cpanel/base/3rdparty/WysiwygPro/editor_files/editor_class.php');

// create a new instance of the wysiwygPro class:
$editor = new wysiwygPro();

// add a custom save button:
$editor->addbutton('Save', 'before:print', 'do_save();', WP_WEB_DIRECTORY.'images/save.gif', 22, 22, 'undo');

// add a custom cancel button:
$editor->addbutton('Cancel', 'before:print', 'do_abort();', WP_WEB_DIRECTORY.'images/cancel.gif', 22, 22, 'undo');

$body = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Psych Desktop</title> 
</head>
<body>
<table style="background: transparent url(http; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial; height: 100%; width: 100%; border-collapse: separate;" width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" background="../images/wallpaper.jpg" align="center"><tbody><tr><td> 
<br></td></tr></tbody></table>
<table border=0 cellpadding=0 cellspacing=0 style="position: absolute; bottom: 0; left: 0; width: 100%; height: 35px; background: url(http://desktop.psychdesigns.net/images/header.gif)"><tr><td style="width: 50px;">menu</td><td style="width: 4px;">|</td><td><center>taskbar area</center></td><td style="width: 4px;">|</td><td style="width: 160px;"><center>icon bin</center></td></tr></table>

</body>
</html>';

$editor->set_code($body);

// add a spacer:
$editor->addspacer('', 'after:cancel');

// print the editor to the browser:
$editor->print_editor('100%',450);

?>
</div>
</body>
</html>
<?php ob_end_flush() ?>
