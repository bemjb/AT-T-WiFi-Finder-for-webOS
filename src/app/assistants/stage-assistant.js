function StageAssistant() {
    /* this is the creator function for your stage assistant object */
}

StageAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when the stage is first created */
    this.controller.pushScene("main");
};

StageAssistant.setupMenu = function(sceneController) {
    sceneController.setupWidget(
        Mojo.Menu.appMenu,
        { omitDefaultItems: true },
        {
            items: [
               { label: 'Enter Address', command: 'address' },
               { label: 'About', command: 'about' },
            ]
        }
    );
};

StageAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'about':
                this.controller.pushAppSupportInfoScene();
                break;
            case 'address':
                this.controller.swapScene(
                    "results",
                    "http://attwifi.know-where.com/attwifip/"
                );
                break;
        }
    }
};
