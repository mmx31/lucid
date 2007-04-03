<?php
if($_SERVER[PHP_SELF]=="/desktop/desktop.php")
   {
   header("Location: /desktop/index.php");
   exit;
   } 
?>
<html>
<title>Psych Desktop</title>
<head>

<!-- delete me later -->
<script type="text/javascript">
var kiosk = 0;
</script>

<!-- css files -->
<link rel="stylesheet" href="desktop.css" type="text/css" media="screen" />
<link rel="stylesheet" href="./pwindowclass/themes/default.css" type="text/css" media="screen" />
<link rel="stylesheet" href="./pwindowclass/themes/alert.css" type="text/css" media="screen" />

<!-- scriptaculous -->
<script src="./scriptaculous/prototype.js" type="text/javascript"></script>
<script src="./scriptaculous/scriptaculous.js" type="text/javascript"></script>

<!-- Window Class -->
<script src="./pwindowclass/javascripts/window.js" type="text/javascript"></script>
<script src="./pwindowclass/javascripts/tooltip.js" type="text/javascript"></script>
<script src="./pwindowclass/javascripts/debug.js" type="text/javascript"></script>

<!-- load all the libraries -->
<script type="text/javascript" language="javascript" src="api.js"></script>
<script type="text/javascript" language="javascript" src="app.js"></script>
<script type="text/javascript" language="javascript" src="appbar.js"></script>
<script type="text/javascript" language="javascript" src="menu.js"></script>
<script type="text/javascript" language="javascript" src="rightclick.js"></script>
<script type="text/javascript" language="javascript" src="screensaver.js"></script>
<script type="text/javascript" language="javascript" src="taskbar.js"></script>
<script type="text/javascript" language="javascript" src="tasktray.js"></script>
<script type="text/javascript" language="javascript" src="tooltip.js"></script>
<script type="text/javascript" language="javascript" src="wallpaper.js"></script>
<script type="text/javascript" language="javascript" src="windows.js"></script>

<!-- defines what the user's name is -->
<?php
echo "\n<script type='text/javascript'>\n" . "var conf_user = '${conf_user}'" . "\n</script>\n";
?>
</head>
<body>

<!-- draw everything, and start the desktop! -->
<script type="text/javascript" language="javascript" src="desktop.js"></script>
<!-- taskbar -->
<div ID='taskbar'><center>loading...</center></div>
<div ID='taskbarhider' onClick="taskbarhider()"><img src="./icons/hidetask.gif"></div>

<!-- menu -->

<div id="sysmenu"><table border="0" cellpadding="0" cellspacing="0"><tr></tr><td><img src="./backgrounds/sysmenutop.gif"></td><tr><td style="background: url(./backgrounds/sysmenumiddle.gif);" align="center">
<script type="text/javascript">
document.write("<i>"+conf_user+"</i><p> </p>")
</script>


<center>
<table cellpadding="0" cellspacing="0" width="90%" id="menu">
<tr><script>app_getApplications();</script>
<td onClick = "app_launch(1);" style="border-top: 1px solid white;">Calculator</td>
</tr>
<tr>
<td onClick = "app_launch(2);" style="border-top: 1px solid white;">Web Browser</td>
</tr>
<tr>
<td onClick = "app_launch(9);" style="border-top: 1px solid white;">Control Panel</td>
</tr>
<tr>
<td onClick = "if(kiosk != 1){exec_app(3, 'both');}else{Dialog.alert('<br><center>Kiosk mode active, console disabled</center>', {width:300, height:100, okLabel: 'close', ok:function(win) {debug('validate alert panel'); return true;}});}" style="border-top: 1px solid white;">Console</td>
</tr>
<tr>
<td onClick="if(kiosk != 1){logout();}else{Dialog.alert('<br><center>Kiosk mode active, logout denied</center>', {width:300, height:100, okLabel: 'close', ok:function(win) {debug('validate alert panel'); return true;}});}"style="border-top: 1px solid white; border-bottom: 1px solid white;">Logout</td>
</tr>
</table>
</center></td></tr></table></div>
<div id="loadingIndicator" style="position: absolute; bottom: 50px; right: 15px; background-color: #444444; color: #FFFFFF; height: 25px; width: 130px; zindex: 1000;"><center><img style="vertical-align: middle;" src='../images/UI/loading.gif' /><span style="vertical-align: middle;"> <b>Loading...</b></span></center></div>
<script type="text/javascript">
Element.hide('sysmenu');
Element.hide('loadingIndicator');
drawtaskbar();
</script>

</body>
</html>
