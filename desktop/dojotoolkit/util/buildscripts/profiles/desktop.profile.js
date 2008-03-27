dependencies ={
    layers:  [
        {
        name: "../desktop/desktop.js",
        dependencies: ["desktop.desktop"]
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