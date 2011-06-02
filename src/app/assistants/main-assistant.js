function MainAssistant() {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
    this.baseURL = 'http://attwifi.know-where.com/attwifip/cgi/selection?mapid=US&lang=en&design=mobile&place=';
    this.model = {
        spinning: true
    }
    this.position = null;
    this.gettingGPSFix = false;
}

MainAssistant.prototype.getGPSFix = function () {
    if (this.gettingGPSFix) return;
    this.gettingGPSFix = true;
    this.controller.serviceRequest("palm://com.palm.location", {
        method: "getCurrentPosition",
        parameters: {
            accuracy: 2,
            maximumAge: 300,
            responseTime: 2
        },
        onSuccess: function (pos) {
            Mojo.Log.info("Got gps fix %s", Object.toJSON(pos));
            this.gettingGPSFix = false;
            this.position = pos;
            this.getReverseLocation();
        }.bind(this),
        onFailure: function (pos) {
            this.gettingGPSFix = false;
            Mojo.Log.error(
                "Failed to get position errorCode = %o", pos.errorCode
            );
            switch (pos.errorCode) {
                case 5: case 6:
                    Mojo.Log.info("Location services need to be turned on!"); 
                    this.controller.stageController.swapScene("location-off");
                    break;
                case 1: case 2:
                    Mojo.Log.info("Temp failure, trying again in 5 seconds.");
                    Mojo.Controller.errorDialog(
                        "Lookup failed, retrying in 5 seconds."
                    );
                    getGPSFix.delay(5);
                    break;
                case 7:
                    Mojo.Log.info("Two GPS lookups at once!");
                    break;
                default:
                    this.failed(
                        "GPS lookup failed for an unknown reason!"
                    );
                    break;
            }
        }.bind(this)
    });
};

MainAssistant.prototype.getReverseLocation = function () {
    var that = this;
    this.controller.serviceRequest("palm://com.palm.location", {
        method: "getReverseLocation",
        parameters: {
            latitude: this.position.latitude,
            longitude: this.position.longitude
        },
        onSuccess: function (address) {
            Mojo.Log.info("Found address %s", Object.toJSON(address));
            var addressLine = address.substreet + " " + address.street + 
                " " + address.city + ", " + address.state;
            var url = this.baseURL + encodeURIComponent(addressLine);
            this.controller.stageController.swapScene("results", url);
        }.bind(this),
        onFailure: function (address) {
            Mojo.Log.error(
                "Failed to get address errorCode = %o", address.errorCode
            );
            switch (address.errorCode) {
                case 5: case 6:
                    Mojo.Log.info("Location services need to be turned on!"); 
                    this.controller.stageController.swapScene("location-off");
                    break;
                case 7:
                    Mojo.Log.info("Two reverse lookups at once!");
                    break;
                default:
                    this.failed(
                        "Reverse address lookup failed for an unknown reason!"
                    );
                    break;
            }
        }.bind(this)
    });
};

MainAssistant.prototype.failed = function(message) {
    this.controller.showAlertDialog({
        title: "Error",
        message: message,
        choices: [{ label: "Ok", value: true, type: "dismiss" }],
        onChoose: function(choice) {
            this.controller.get("spinner").mojo.stop();
            this.controller.get("spinner").hide();
            this.controller.get('failed').show();
        }
    });
};

MainAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
            
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    StageAssistant.setupMenu(this.controller);

    this.controller.setupWidget(
        "spinner",
        { spinnerSize: Mojo.Widget.spinnerLarge },
        this.model
    );

    this.controller.get('failed').hide();
    
    /* add event handlers to listen to events from widgets */
};

MainAssistant.prototype.activate = function(event) {
    /* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
    this.getGPSFix();
};

MainAssistant.prototype.deactivate = function(event) {
    /* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
};
