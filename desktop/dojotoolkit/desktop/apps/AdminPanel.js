dojo.provide("desktop.apps.AdminPanel");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid._data.editors");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Menu");
dojo.require("dijit.Dialog");
dojo.require("dojox.widget.FileInputAuto");
desktop.addDojoCss("dojox/grid/resources/Grid.css");
desktop.addDojoCss("dojox/widget/FileInput/FileInput.css");

//require parts of admin panel
dojo.require("desktop.apps.AdminPanel._base");
dojo.require("desktop.apps.AdminPanel.apps");
dojo.require("desktop.apps.AdminPanel.groups");
dojo.require("desktop.apps.AdminPanel.permissions");
dojo.require("desktop.apps.AdminPanel.quota");
dojo.require("desktop.apps.AdminPanel.themes");
dojo.require("desktop.apps.AdminPanel.users");

//localization
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop", "system");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "permissions");
dojo.requireLocalization("desktop.ui", "accountInfo");
dojo.requireLocalization("desktop.ui", "menus");
