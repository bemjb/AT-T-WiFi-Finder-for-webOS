function ResultsAssistant(address) {
    /* this is the creator function for your scene assistant object. It will be passed all the 
       additional parameters (after the scene name) that were passed to pushScene. The reference
       to the scene controller (this.controller) has not be established yet, so any initialization
       that needs the scene controller should be done in the setup function below. */
    this.baseURL = 'http://attwifi.know-where.com/attwifip/cgi/selection?mapid=US&lang=en&design=mobile&place=';
    this.address = address;
    this.webAttrs = {
        url: this.baseURL + encodeURIComponent(address)
    };
    this.model = {
        progressValue: 0,
        progressStart: 0,
        spinning: true
    };
}

ResultsAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the scene is first created */
            
    /* use Mojo.View.render to render view templates and add them to the scene, if needed */
    
    /* setup widgets here */
    StageAssistant.setupMenu(this.controller);

    this.controller.setupWidget(
        'progress-spinner', 
        { spinnerSize: Mojo.Widget.spinnerLarge },
        this.model
    );
    this.controller.setupWidget(
        "progress",
        {
            title: "Loading...",
            modelProperty: "progressValue",
            modelStartProperty: "progressStart"
        },
        this.model
    );
    this.controller.setupWidget("web", this.webAttrs, {}); 

    this.controller.get('progress-body').hide();
    
    /* add event handlers to listen to events from widgets */
    this.startLoadHandlerBound = this.startLoadHandler.bind(this);
    this.loadProgressHandlerBound = this.loadProgressHandler.bind(this);
    this.stopLoadHandlerBound = this.stopLoadHandler.bind(this);
    this.failedLoadHandlerBound = this.failedLoadHandler.bind(this);

    this.controller.listen(
        this.controller.get("web"),
        Mojo.Event.webViewLoadStarted,
        this.startLoadHandlerBound
    );
    this.controller.listen(
        this.controller.get("web"),
        Mojo.Event.webViewLoadProgress,
        this.loadProgressHandlerBound
    );
    this.controller.listen(
        this.controller.get("web"),
        Mojo.Event.webViewLoadStopped,
        this.stopLoadHandlerBound
    );
    this.controller.listen(
        this.controller.get("web"),
        Mojo.Event.webViewLoadFailed,
        this.failedLoadHandlerBound
    );

};

ResultsAssistant.prototype.startLoadHandler = function (event) {
    this.controller.get('progress-body').show();
    this.controller.get('progress').mojo.reset();
};

ResultsAssistant.prototype.loadProgressHandler = function (progress) {
    Mojo.Log.info("progress %s", Object.toJSON(progress));
    this.model.progressValue = progress.progress/100.0;
    this.controller.modelChanged(this.model);
};

ResultsAssistant.prototype.stopLoadHandler = function (event) {
    this.controller.get('progress-body').hide();
};

ResultsAssistant.prototype.failedLoadHandler = function (errorCode, message) {
    Mojo.Log.error(
        "Failed to load page. Error code = %s, message = %s",
        errorCode,
        message
    );
    Mojo.Controller.errorDialog(message);
};

ResultsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

ResultsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ResultsAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is destroyed as 
       a result of being popped off the scene stack */
    this.controller.stopListening(
        this.controller.get("web"),
        Mojo.Event.webViewLoadStarted,
        this.startLoadHandlerBound
    );
    this.controller.stopListening(
        this.controller.get("web"),
        Mojo.Event.webViewLoadProgress,
        this.loadProgressHandlerBound
    );
    this.controller.stopListening(
        this.controller.get("web"),
        Mojo.Event.webViewLoadStopped,
        this.stopLoadHandlerBound
    );
    this.controller.stopListening(
        this.controller.get("web"),
        Mojo.Event.webViewLoadFailed,
        this.failedLoadHandlerBound
    );
};
