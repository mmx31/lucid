To install:
	*Open install.php in a browser, and install.
	 Follow the installer's instructions.

Customizing:
	If you use a CMS or want to intergrate it into a template, website, etc,
	you can use the javascript login form made. First, insert this
	div element onto your page. This is where the form will be displayed.
	You may apply any CSS properties to it, as long as the ID of the element
	stays intact.
	
		<div id="psychdesktop_login"></div>

	Then, include this code just before the </body> tag of the document/template,
	replacing '/path/to/' with your psych desktop installation path:
	
		<script type="text/javascript" src="/path/to/login.js"></script>
		
	
	
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
