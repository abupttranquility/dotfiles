var ActivitiesProcessor = (function () {
    function ActivitiesProcessor(appResources, userSettings) {
        this.appResources = appResources;
        this.userSettings = userSettings;
    }
    ActivitiesProcessor.prototype.compute = function (activitiesWithStream) {
        var _this = this;
        var deferred = Q.defer();
        var computedActivitiesPercentageCount = 0;
        var activitiesComputedResults = [];
        var queue = activitiesWithStream.reduce(function (promise, activityWithStream, index) {
            return promise.then(function () {
                return _this.computeActivity(activityWithStream).then(function (activityComputed) {
                    activitiesComputedResults.push(activityComputed);
                    var notify = {
                        step: 'computedActivitiesPercentage',
                        progress: computedActivitiesPercentageCount / activitiesWithStream.length * 100,
                        index: index,
                        activityId: activityWithStream.id,
                    };
                    deferred.notify(notify);
                    computedActivitiesPercentageCount++;
                });
            });
        }, Q.resolve({}));
        queue.then(function () {
            if (activitiesComputedResults.length !== activitiesWithStream.length) {
                var errMessage = 'activitiesComputedResults length mismatch with activitiesWithStream length: ' + activitiesComputedResults.length + ' != ' + activitiesWithStream.length + ')';
                deferred.reject(errMessage);
            }
            else {
                var activitiesComputed_1 = [];
                _.each(activitiesComputedResults, function (computedResult, index) {
                    var activityComputed = _.pick(activitiesWithStream[index], ActivitiesProcessor.outputFields);
                    activityComputed.extendedStats = computedResult;
                    activitiesComputed_1.push(activityComputed);
                });
                activitiesComputed_1 = _.sortBy(activitiesComputed_1, function (item) {
                    return (new Date(item.start_time)).getTime();
                });
                var notify = {
                    step: 'computedActivitiesPercentage',
                    progress: 100
                };
                deferred.notify(notify);
                deferred.resolve(activitiesComputed_1);
                activitiesComputedResults = null;
                activitiesWithStream = null;
                activitiesComputed_1 = null;
            }
        }).catch(function (error) {
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };
    ActivitiesProcessor.prototype.createActivityStatMap = function (activityWithStream) {
        var statsMap = {
            distance: parseInt(activityWithStream.distance),
            elevation: parseInt(activityWithStream.elevation_gain),
            avgPower: null,
            averageSpeed: null
        };
        return statsMap;
    };
    ActivitiesProcessor.prototype.computeActivity = function (activityWithStream) {
        var deferred = Q.defer();
        var computeAnalysisThread = new Worker(URL.createObjectURL(new Blob(['(', ComputeAnalysisWorker.toString(), ')()'], {
            type: 'application/javascript'
        })));
        var activityStatsMap = this.createActivityStatMap(activityWithStream);
        var threadMessage = {
            activityType: activityWithStream.type,
            isTrainer: activityWithStream.trainer,
            appResources: this.appResources,
            userSettings: this.userSettings,
            athleteWeight: this.userSettings.userWeight,
            hasPowerMeter: activityWithStream.hasPowerMeter,
            activityStatsMap: activityStatsMap,
            activityStream: activityWithStream.stream,
            bounds: null,
            returnZones: false
        };
        computeAnalysisThread.postMessage(threadMessage);
        computeAnalysisThread.onmessage = function (messageFromThread) {
            deferred.notify(activityWithStream.id);
            deferred.resolve(messageFromThread.data);
            computeAnalysisThread.terminate();
        };
        computeAnalysisThread.onerror = function (err) {
            var errorMessage = {
                errObject: err,
                activityId: activityWithStream.id,
            };
            console.error(errorMessage);
            deferred.reject(errorMessage);
            computeAnalysisThread.terminate();
        };
        return deferred.promise;
    };
    ActivitiesProcessor.outputFields = ["id", "name", "type", "display_type", "private", "bike_id", "start_time", "distance_raw", "short_unit", "moving_time_raw", "elapsed_time_raw", "trainer", "commute", "elevation_unit", "elevation_gain_raw", "calories", "hasPowerMeter"];
    return ActivitiesProcessor;
}());
