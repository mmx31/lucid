To install:
	*Open install.php in a browser, and install.
	 Follow the installer's instructions.

Customizing:
	If you use a CMS or want to intergrate it into a template, website, etc,
	you can use the php include function to include the following php files:

		*editaccount.php --so the user can edit their account
		*forgotpass.php --for lost passwords
		*register.php --for user registration.

	You can delete register.php if you want it to be private 
	(for something like a private installation). You will need to
	add each account manually in the backend in this case.
	You can include a php script by using:

		<?php include("./desktop/page.php"); ?>

	For the capatcha images to work properly, you need to add this PHP code.
	If you use static pages, add this code to only the pages including the script. It must be as close to line 1 as possible.
	If you're using a CMS, add this to your template, or the index.php of the CMS. This varies, so it's usually best to ask
	someone how to go about doing this.
	This is very important, otherwise the users will not be able to use these pages!

	<?php session_start(); global $code; ?>

	If you experience problems with your website/cms when adding this code (which is common for CMS users),
	try adding this. Make sure you change the example URLs given to the actual URLs.
	If you're not using register.php, remove that line, and the comma trailing after the line before.

	<?php
		$pages = array(
				"http://www.website.com/index.php?page=register",
				"http://www.website.com/index.php?page=forgotpass",
				"http://www.website.com/index.php?page=register.php"
		);
		foreach($pages as $page) {
			if($_SERVER['SERVER_SELF'] == $page)
			{
				session_start();
				global $code;
			}
		}
	?>
	
	If you still have problems, contact the psych desktop team either through IRC (preferred) at freenode #psychdesktop, or making a forum post.
	To launch the desktop, put this in the head of your HTML document:

		<SCRIPT LANGUAGE="JavaScript">
		function popUp() {
			URL = "./backend/desktop_login.php";
			day = new Date();
			id = day.getTime();
			eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=1,width=1024,height=768,left = 0,top = 0,fullscreen=1');");
		}
		</script>
	
	If the desktop is installed in a different directory make sure you change the URL variable.

	Then, to open the URL use a link or button:

	Button:
		<input type=button value="Launch Desktop" onClick="javascript:popUp()" />
	Link:
		<a href="javascript:popUp()">Launch Desktop</a>

	To access the administration panel, just add /admin/ to the installation directory
	of the desktop.

	That's it, enjoy your installation of psych desktop!

Manual Installation:

	*Make a database, and grant all permissions to a mySQL user.
	*Open database.sql. Replace '#__' with your desired table prefix.
	*run database.sql on the database
	*Edit /backend/config.php to fit your server's environment.
	 Specify a random string for $conf_secretword.
	 This can be any combination of letters and numbers.
	*In order to insert the administrator, you must use the
	 installer so it will encrypt your password correctly.
	 The installer will import anything you set in your config file.
	 Set the "Fresh Install" option to 'no' in this case.
	*Installation is done.
