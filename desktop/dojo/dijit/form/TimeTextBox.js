if(!dojo._hasResource["dijit.form.TimeTextBox"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dijit.form.TimeTextBox"] = true;
dojo.provide("dijit.form.TimeTextBox");

dojo.require("dijit._TimePicker");
dojo.require("dijit.form._DateTimeTextBox");

dojo.declare(
	"dijit.form.TimeTextBox",
	dijit.form._DateTimeTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound time text box.

		popupClass: "dijit._TimePicker",
		_selector: "time"
	}
);

}
