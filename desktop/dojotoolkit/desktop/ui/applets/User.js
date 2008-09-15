dojo.provide("desktop.ui.applets.User");

dojo.declare("desktop.ui.applets.User", desktop.ui.Applet, {
    dispName: "User",
    postCreate: function() {
        var labelNode = this.containerNode;
        desktop.user.get({callback: function(data) {
            labelNode.innerHTML = data.name || data.username;
        }});
        this.inherited(arguments);
    }
});
