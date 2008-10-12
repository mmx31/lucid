dependencies ={
    layers:  [
		//CORE
        {
        	name: "../desktop/desktop.js",
        	dependencies: ["desktop.desktop"]
        },
        {
        	name: "../login/Form.js",
        	dependencies: ["login.Form"]
        },
		//APPS
		{
			name: "../desktop/apps/AccountInfo.js",
			dependencies: ["desktop.apps.AccountInfo"]
		},
		{
			name: "../desktop/apps/AdminPanel.js",
			dependencies: ["desktop.apps.AdminPanel"]
		},
		{
			name: "../desktop/apps/AppearanceConfig.js",
			dependencies: ["desktop.apps.AppearanceConfig"]
		},
		{
			name: "../desktop/apps/Calculator.js",
			dependencies: ["desktop.apps.Calculator"]
		},
		{
			name: "../desktop/apps/Checkers.js",
			dependencies: ["desktop.apps.Checkers"]
		},
		{
			name: "../desktop/apps/Contacts.js",
			dependencies: ["desktop.apps.Contacts"]
		},
		{
			name: "../desktop/apps/FeedReader.js",
			dependencies: ["desktop.apps.FeedReader"]
		},
		{
			name: "../desktop/apps/FileBrowser.js",
			dependencies: ["desktop.apps.FileBrowser"]
		},
		{
			name: "../desktop/apps/ImageViewer.js",
			dependencies: ["desktop.apps.ImageViewer"]
		},
		{
			name: "../desktop/apps/KatanaIDE.js",
			dependencies: ["desktop.apps.KatanaIDE"]
		},
		{
			name: "../desktop/apps/MineSweep.js",
			dependencies: ["desktop.apps.MineSweep"]
		},
		{
			name: "../desktop/apps/MusicPlayer.js",
			dependencies: ["desktop.apps.MusicPlayer"]
		},
		{
			name: "../desktop/apps/StartupConfig.js",
			dependencies: ["desktop.apps.StartupConfig"]
		},
		{
			name: "../desktop/apps/TaskManager.js",
			dependencies: ["desktop.apps.TaskManager"]
		},
		{
			name: "../desktop/apps/Terminal.js",
			dependencies: ["desktop.apps.Terminal"]
		},
		{
			name: "../desktop/apps/TextEditor.js",
			dependencies: ["desktop.apps.TextEditor"]
		},
		{
			name: "../desktop/apps/UpdateManager.js",
			dependencies: ["desktop.apps.UpdateManager"]
		},
		{
			name: "../desktop/apps/WebBrowser.js",
			dependencies: ["desktop.apps.WebBrowser"]
		},
		{
			name: "../desktop/apps/WordProcessor.js",
			dependencies: ["desktop.apps.WordProcessor"]
		}
    ],
    prefixes: [
        [ "desktop", "../desktop" ],
        [ "api", "../api" ],
        [ "login", "../login" ],
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ]
    ]
};
