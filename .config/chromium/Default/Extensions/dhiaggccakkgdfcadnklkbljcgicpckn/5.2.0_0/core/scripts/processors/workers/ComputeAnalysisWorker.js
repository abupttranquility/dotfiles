function ComputeAnalysisWorker() {
    var _this = this;
    this.required = [
        '/core/scripts/Helper.js',
        '/node_modules/underscore/underscore-min.js',
        '/core/scripts/processors/ActivityComputer.js'
    ];
    this.onmessage = function (mainThreadEvent) {
        _this.importRequiredLibraries(_this.required, mainThreadEvent.data.appResources.extensionId);
        var threadMessage = mainThreadEvent.data;
        var analysisComputer = new ActivityComputer(threadMessage.activityType, threadMessage.isTrainer, threadMessage.userSettings, threadMessage.athleteWeight, threadMessage.hasPowerMeter, threadMessage.activityStatsMap, threadMessage.activityStream, threadMessage.bounds, threadMessage.returnZones);
        var result = analysisComputer.compute();
        _this.postMessage(result);
    };
    this.importRequiredLibraries = function (libsFromExtensionPath, chromeExtensionId) {
        for (var i = 0; i < libsFromExtensionPath.length; i++) {
            importScripts('chrome-extension://' + chromeExtensionId + libsFromExtensionPath[i]);
        }
    };
}
