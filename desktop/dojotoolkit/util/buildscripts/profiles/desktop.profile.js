dependencies ={
    layers:  [
		//CORE
        {
        	name: "../desktop/desktop.js",
        	dependencies: ["desktop.desktop"]
        },
        {
        	name: "../desktop/login/Form.js",
        	dependencies: ["desktop.login.Form"]
        },
		//APPS
		{
			name: "../desktop/apps/AccountInfo.js",
			dependencies: ["desktop.apps.AccountInfo"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/AdminPanel.js",
			dependencies: ["desktop.apps.AdminPanel"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/AppearanceConfig.js",
			dependencies: ["desktop.apps.AppearanceConfig"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/Calculator.js",
			dependencies: ["desktop.apps.Calculator"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/Checkers.js",
			dependencies: ["desktop.apps.Checkers"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/Contacts.js",
			dependencies: ["desktop.apps.Contacts"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/FeedReader.js",
			dependencies: ["desktop.apps.FeedReader"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/FileBrowser.js",
			dependencies: ["desktop.apps.FileBrowser"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/ImageViewer.js",
			dependencies: ["desktop.apps.ImageViewer"]
		},
		{
			name: "../desktop/apps/KatanaIDE.js",
			dependencies: ["desktop.apps.KatanaIDE"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/Messenger.js",
			dependencies: ["desktop.apps.Messenger"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/MineSweep.js",
			dependencies: ["desktop.apps.MineSweep"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/MusicPlayer.js",
			dependencies: ["desktop.apps.MusicPlayer"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/StartupConfig.js",
			dependencies: ["desktop.apps.StartupConfig"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/TaskManager.js",
			dependencies: ["desktop.apps.TaskManager"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/Terminal.js",
			dependencies: ["desktop.apps.Terminal"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/TextEditor.js",
			dependencies: ["desktop.apps.TextEditor"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/UpdateManager.js",
			dependencies: ["desktop.apps.UpdateManager"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/WebBrowser.js",
			dependencies: ["desktop.apps.WebBrowser"],
            layerDependencies: ["../desktop/desktop.js"]
		},
		{
			name: "../desktop/apps/WordProcessor.js",
			dependencies: ["desktop.apps.WordProcessor"],
            layerDependencies: ["../desktop/desktop.js"]
		}
    ],
    prefixes: [
        [ "desktop", "../desktop" ],
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ]
    ]
};
