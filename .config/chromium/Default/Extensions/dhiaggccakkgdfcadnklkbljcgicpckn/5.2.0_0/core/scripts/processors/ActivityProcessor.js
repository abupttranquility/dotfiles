var ActivityProcessor = (function () {
    function ActivityProcessor(appResources, vacuumProcessor, userSettings) {
        this.appResources = appResources;
        this.vacuumProcessor = vacuumProcessor;
        this.userSettings = userSettings;
        this.userHrrZones = this.userSettings.userHrrZones;
        this.zones = this.userSettings.zones;
    }
    ActivityProcessor.prototype.setActivityType = function (activityType) {
        this.activityType = activityType;
    };
    ActivityProcessor.prototype.setTrainer = function (isTrainer) {
        if (isTrainer) {
            if (_.isBoolean(isTrainer)) {
                this.isTrainer = isTrainer;
            }
            else {
                console.error("isTrainer(boolean): required boolean param");
            }
        }
    };
    ActivityProcessor.prototype.getAnalysisData = function (activityId, bounds, callback) {
        var _this = this;
        if (!this.activityType) {
            console.error('No activity type set for ActivityProcessor');
        }
        var useCache = true;
        if (!_.isEmpty(bounds)) {
            useCache = false;
        }
        if (useCache) {
            var cacheResult = JSON.parse(localStorage.getItem(ActivityProcessor.cachePrefix + activityId));
            if (!_.isNull(cacheResult) && env.useActivityStreamCache) {
                console.log("Using existing activity cache mode");
                callback(cacheResult);
                return;
            }
        }
        this.vacuumProcessor.getActivityStream(function (activityStatsMap, activityStream, athleteWeight, hasPowerMeter) {
            _this.computeAnalysisThroughDedicatedThread(hasPowerMeter, activityStatsMap, activityStream, bounds, function (resultFromThread) {
                callback(resultFromThread);
                if (useCache) {
                    console.log("Creating activity cache");
                    try {
                        localStorage.setItem(ActivityProcessor.cachePrefix + activityId, JSON.stringify(resultFromThread));
                    }
                    catch (err) {
                        console.warn(err);
                        localStorage.clear();
                    }
                }
            });
        });
    };
    ActivityProcessor.prototype.computeAnalysisThroughDedicatedThread = function (hasPowerMeter, activityStatsMap, activityStream, bounds, callback) {
        var _this = this;
        if (!this.computeAnalysisWorkerBlobURL) {
            var blob = new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], { type: 'application/javascript' });
            this.computeAnalysisWorkerBlobURL = URL.createObjectURL(blob);
        }
        this.computeAnalysisThread = new Worker(this.computeAnalysisWorkerBlobURL);
        var threadMessage = {
            activityType: this.activityType,
            isTrainer: this.isTrainer,
            appResources: this.appResources,
            userSettings: this.userSettings,
            athleteWeight: this.userSettings.userWeight,
            hasPowerMeter: hasPowerMeter,
            activityStatsMap: activityStatsMap,
            activityStream: activityStream,
            bounds: bounds,
            returnZones: true
        };
        this.computeAnalysisThread.postMessage(threadMessage);
        this.computeAnalysisThread.onmessage = function (messageFromThread) {
            callback(messageFromThread.data);
            _this.computeAnalysisThread.terminate();
        };
    };
    ActivityProcessor.cachePrefix = 'stravistix_activity_';
    return ActivityProcessor;
}());
