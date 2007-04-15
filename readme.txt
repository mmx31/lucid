To install:
	*Open install.php in a browser, and install.

Customizing:
	If you use a CMS or want to intergrate it into a template, website, etc,
	you can use the php include function to include the following php files:

		*editaccount.php --so the user can edit their account
		*forgotpass.php --for lost passwords
		*register.php --for user registration.

	You can delete register.php if you want it to be private 
	(for something like a private installation). You will need to
	add each account manually in the backend in this case.

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