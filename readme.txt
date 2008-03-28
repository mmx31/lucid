To install:
	*Open /install/ in a browser, and install.
	 Follow the installer's instructions.

Customizing:
	If you use a CMS or want to intergrate it into a template, website, etc,
	you can use the javascript login form made. First, insert this
	div element onto your page. This is where the form will be displayed.
	You may apply any CSS properties or classes to it, as long as the dojoType property of the element
	stays intact.
	
		<div dojoType="login.Form"></div>
		
	There are extra parameters that you can add to the div. The login form fetches parts of the desktop
	when the user begins to type in their login information. This gets cached by the browser, so the desktop
	loads faster when the user actually logs into the desktop. To prevent this behaviour, just add preload="false"
	to the form:
		
		<div dojoType="login.Form" preload="false"></div>

	Then, include this code just before the </body> tag of the document/template,
	replacing *BOTH* "desktop_installDir"s with your psych desktop installation path:
	
		<link href="desktop_installDir/desktop/dojotoolkit/dijit/themes/dijit.css" rel="stylesheet" type="text/css" />
		<script type="text/javascript" src="desktop_installDir/desktop/dojotoolkit/dojo/dojo.js"></script>
		<script type="text/javascript">dojo.require("login.Form");</script>
		
	You can theme the login form as you wish using CSS. If you do not want to do this,
	you can add one of the following to your page (again, make sure you replace "desktop_installDir" with your installation dir):
	
	Choice 1:
		<link href="desktop_installDir/desktop/dojotoolkit/dijit/themes/tundra/tundra.css" rel="stylesheet" type="text/css" />
		...
		<body class="tundra">
	Choice 2:
		<link href="desktop_installDir/desktop/dojotoolkit/dijit/themes/soria/soria.css" rel="stylesheet" type="text/css" />
		...
		<body class="soria">
	Choice 3:
		<link href="desktop_installDir/desktop/dojotoolkit/dijit/themes/nihilo/nihilo.css" rel="stylesheet" type="text/css" />
		...
		<body class="nihilo">
		
	If you don't need the default page provided, you may delete it along with the /images/ directory.
	
	That's it, enjoy your installation of psych desktop!
