dependencies ={
    layers:  [
        {
        	name: "../desktop/desktop.js",
        	dependencies: ["desktop.desktop"]
        },
        {
        	name: "../login/Form.js",
        	dependencies: ["login.Form"]
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