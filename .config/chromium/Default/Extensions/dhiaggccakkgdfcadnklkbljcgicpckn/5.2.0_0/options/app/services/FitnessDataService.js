app.factory('FitnessDataService', ['$q', 'ChromeStorageService', function ($q, chromeStorageService) {
        var onGetComputedActivitiesTimeStart;
        var onGetFitnessDataTimeDone;
        var FUTURE_DAYS_PREVIEW = 14;
        var fitnessDataService = {
            fitnessData: null,
            getComputedActivities: null,
            getCleanedComputedActivitiesWithHeartRateData: null,
            getFitnessObjectsWithDaysOff: null,
            computeChronicAcuteBalanceTrainingLoad: null,
            getFitnessData: null,
        };
        fitnessDataService.getComputedActivities = function () {
            var deferred = $q.defer();
            onGetComputedActivitiesTimeStart = performance.now();
            console.log('Fetch computedActivities from chromeStorageService');
            chromeStorageService.fetchComputedActivities().then(function (computedActivities) {
                deferred.resolve(computedActivities);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        fitnessDataService.getCleanedComputedActivitiesWithHeartRateData = function () {
            var deferred = $q.defer();
            console.log('Fetch computedActivitiesWithHR from fitnessDataService.getCleanedComputedActivitiesWithHeartRateData');
            fitnessDataService.getComputedActivities().then(function (computedActivities) {
                var cleanedActivitiesWithHRData = [];
                _.each(computedActivities, function (activity) {
                    if (activity.extendedStats && activity.extendedStats.heartRateData) {
                        var momentStartTime = moment(activity.start_time);
                        var activityHR = {
                            id: activity.id,
                            date: momentStartTime.toDate(),
                            timestamp: momentStartTime.toDate().getTime(),
                            dayOfYear: momentStartTime.dayOfYear(),
                            year: momentStartTime.year(),
                            type: activity.display_type,
                            activityName: activity.name,
                            trimp: parseInt(activity.extendedStats.heartRateData.TRIMP.toFixed(0))
                        };
                        cleanedActivitiesWithHRData.push(activityHR);
                    }
                });
                deferred.resolve(cleanedActivitiesWithHRData);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        fitnessDataService.getFitnessObjectsWithDaysOff = function () {
            var deferred = $q.defer();
            console.log('Fetch fitnessObjectsWithDaysOff from fitnessDataService.getFitnessObjectsWithDaysOff');
            fitnessDataService.getCleanedComputedActivitiesWithHeartRateData().then(function (cleanedActivitiesWithHRData) {
                var fromMoment = moment(_.first(cleanedActivitiesWithHRData).date).subtract(1, 'days').startOf('day');
                var todayMoment = moment().endOf('day');
                var everyDayFitnessObjects = [];
                var currentDayMoment = moment(fromMoment);
                while (currentDayMoment.isSameOrBefore(todayMoment)) {
                    var foundOnToday = _.where(cleanedActivitiesWithHRData, {
                        year: currentDayMoment.year(),
                        dayOfYear: currentDayMoment.dayOfYear()
                    });
                    var fitnessObjectOnCurrentDay = {
                        ids: [],
                        date: currentDayMoment.toDate(),
                        timestamp: currentDayMoment.toDate().getTime(),
                        type: [],
                        activitiesName: [],
                        trimp: 0,
                        previewDay: false
                    };
                    if (foundOnToday.length) {
                        for (var j = 0; j < foundOnToday.length; j++) {
                            fitnessObjectOnCurrentDay.ids.push(foundOnToday[j].id);
                            fitnessObjectOnCurrentDay.trimp += foundOnToday[j].trimp;
                            fitnessObjectOnCurrentDay.activitiesName.push(foundOnToday[j].activityName);
                            fitnessObjectOnCurrentDay.type.push(foundOnToday[j].type);
                        }
                    }
                    everyDayFitnessObjects.push(fitnessObjectOnCurrentDay);
                    currentDayMoment.add(1, 'days');
                }
                for (var i = 1; i <= FUTURE_DAYS_PREVIEW; i++) {
                    var futureDate = moment().add(i, 'days').startOf('day').toDate();
                    var fitnessObjectOnCurrentDay = {
                        ids: [],
                        date: futureDate,
                        timestamp: futureDate.getTime(),
                        type: [],
                        activitiesName: [],
                        trimp: 0,
                        previewDay: true
                    };
                    everyDayFitnessObjects.push(fitnessObjectOnCurrentDay);
                }
                deferred.resolve(everyDayFitnessObjects);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
        fitnessDataService.computeChronicAcuteBalanceTrainingLoad = function (fitnessObjectsWithDaysOff) {
            var ctl = 0;
            var atl = 0;
            var tsb = 0;
            var results = [];
            _.each(fitnessObjectsWithDaysOff, function (trimpObject, index, list) {
                ctl = ctl + (trimpObject.trimp - ctl) * (1 - Math.exp(-1 / 42));
                atl = atl + (trimpObject.trimp - atl) * (1 - Math.exp(-1 / 7));
                tsb = ctl - atl;
                var result = {
                    ids: trimpObject.ids,
                    date: trimpObject.date.toLocaleDateString(),
                    timestamp: trimpObject.timestamp,
                    activitiesName: trimpObject.activitiesName,
                    type: trimpObject.type,
                    trimp: trimpObject.trimp,
                    ctl: parseFloat(ctl.toFixed(1)),
                    atl: parseFloat(atl.toFixed(1)),
                    tsb: parseFloat(tsb.toFixed(1)),
                    previewDay: trimpObject.previewDay,
                };
                if (list[index - 1] && list[index - 1].previewDay !== list[index].previewDay) {
                    console.log('First preview day is', list[index].date);
                    var lastResult = _.last(results);
                    var fillTheCurvesGapWithFakeResult = {
                        ids: null,
                        date: lastResult.date,
                        timestamp: lastResult.timestamp,
                        activitiesName: null,
                        type: null,
                        trimp: null,
                        ctl: lastResult.ctl,
                        atl: lastResult.atl,
                        tsb: lastResult.tsb,
                        previewDay: true,
                    };
                    results.push(fillTheCurvesGapWithFakeResult);
                }
                results.push(result);
            });
            return results;
        };
        fitnessDataService.getFitnessData = function () {
            var deferred = $q.defer();
            if (!fitnessDataService.fitnessData) {
                console.log('Fetch fitnessData from fitnessDataService.getFitnessData');
                fitnessDataService.getFitnessObjectsWithDaysOff().then(function (fitnessObjectsWithDaysOff) {
                    fitnessDataService.fitnessData = fitnessDataService.computeChronicAcuteBalanceTrainingLoad(fitnessObjectsWithDaysOff);
                    deferred.resolve(fitnessDataService.fitnessData);
                    onGetFitnessDataTimeDone = performance.now();
                    console.log("Generating FitnessData from storage took " + (onGetFitnessDataTimeDone - onGetComputedActivitiesTimeStart).toFixed(0) + " ms.");
                }, function (err) {
                    deferred.reject(err);
                });
            }
            else {
                console.log('Fetch fitnessData from FitnessDataService local var');
                deferred.resolve(fitnessDataService.fitnessData);
            }
            return deferred.promise;
        };
        return fitnessDataService;
    }]);
