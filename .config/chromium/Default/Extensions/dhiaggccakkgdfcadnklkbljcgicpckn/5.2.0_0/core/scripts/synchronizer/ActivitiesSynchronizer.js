var ActivitiesSynchronizer = (function () {
    function ActivitiesSynchronizer(appResources, userSettings) {
        this.totalRawActivityIds = [];
        this._hasBeenComputedActivities = null;
        this._endReached = false;
        this._globalHistoryChanges = {
            added: [],
            deleted: [],
            edited: []
        };
        this.appResources = appResources;
        this.userSettings = userSettings;
        this.extensionId = this.appResources.extensionId;
        this._activitiesProcessor = new ActivitiesProcessor(this.appResources, this.userSettings);
    }
    ActivitiesSynchronizer.prototype.appendGlobalHistoryChanges = function (historyIn) {
        this._globalHistoryChanges.added = _.union(this._globalHistoryChanges.added, historyIn.added);
        this._globalHistoryChanges.deleted = _.union(this._globalHistoryChanges.deleted, historyIn.deleted);
        this._globalHistoryChanges.edited = _.union(this._globalHistoryChanges.edited, historyIn.edited);
    };
    ActivitiesSynchronizer.findAddedAndEditedActivities = function (rawActivities, computedActivities) {
        var added = [];
        var deleted = [];
        var edited = [];
        if (_.isNull(computedActivities) || _.isUndefined(computedActivities) || !computedActivities) {
            computedActivities = [];
        }
        if (!_.isEmpty(rawActivities)) {
            _.each(rawActivities, function (rawActivity) {
                var foundComputedActivity = _.findWhere(computedActivities, { id: rawActivity.id });
                if (foundComputedActivity) {
                    if (foundComputedActivity.name !== rawActivity.name || foundComputedActivity.type !== rawActivity.type) {
                        edited.push({
                            id: foundComputedActivity.id,
                            name: rawActivity.name,
                            type: rawActivity.type,
                            display_type: rawActivity.display_type
                        });
                    }
                }
                else {
                    added.push(rawActivity.id);
                }
            });
        }
        var historyChanges = {
            added: added,
            deleted: deleted,
            edited: edited
        };
        return historyChanges;
    };
    ActivitiesSynchronizer.findDeletedActivities = function (rawActivityIds, computedActivities) {
        var added = [];
        var deleted = [];
        var edited = [];
        _.each(computedActivities, function (computedActivity) {
            var notFound = (_.indexOf(rawActivityIds, computedActivity.id) == -1);
            if (notFound) {
                deleted.push(computedActivity.id);
            }
        });
        var historyChanges = {
            added: added,
            deleted: deleted,
            edited: edited
        };
        return historyChanges;
    };
    ActivitiesSynchronizer.prototype.fetchWithStream = function (lastSyncDateTime, fromPage, pagesToRead) {
        var _this = this;
        var deferred = Q.defer();
        this.fetchRawActivitiesRecursive(lastSyncDateTime, fromPage, pagesToRead).then(function (rawActivities) {
            console.log('Activities fetched in group ' + _this.printGroupLimits(fromPage, pagesToRead) + ': ' + rawActivities.length);
            var fetchedActivitiesStreamCount = 0;
            var fetchedActivitiesProgress = 0;
            var promisesOfActivitiesStreamById = [];
            _this.getComputedActivitiesFromLocal().then(function (computedActivitiesStored) {
                var historyChangesOnPagesRode = ActivitiesSynchronizer.findAddedAndEditedActivities(rawActivities, (computedActivitiesStored.data) ? computedActivitiesStored.data : []);
                _this.appendGlobalHistoryChanges(historyChangesOnPagesRode);
                _.each(historyChangesOnPagesRode.added, function (activityId) {
                    promisesOfActivitiesStreamById.push(_this.fetchStreamByActivityId(activityId));
                });
                _.each(rawActivities, function (rawActivity) {
                    _this.totalRawActivityIds.push(rawActivity.id);
                });
                Q.allSettled(promisesOfActivitiesStreamById).then(function (streamResults) {
                    console.log('Stream length: ' + streamResults.length + ', raw activities length: ' + rawActivities.length + ')');
                    var activitiesWithStream = [];
                    _.each(streamResults, function (data) {
                        if (data.state === 'rejected') {
                            console.warn('Stream not found for activity <' + data.reason.activityId + '>', data);
                            var newlyDetectedActivity = _.findWhere(rawActivities, { id: data.reason.activityId });
                            var activityWithStream = newlyDetectedActivity;
                            activityWithStream.hasPowerMeter = null;
                            activityWithStream.stream = null;
                            activitiesWithStream.push(activityWithStream);
                        }
                        else if (data.state === 'fulfilled') {
                            var newlyDetectedActivity = _.findWhere(rawActivities, { id: data.value.activityId });
                            var hasPowerMeter = true;
                            if (_.isEmpty(data.value.watts)) {
                                data.value.watts = data.value.watts_calc;
                                hasPowerMeter = false;
                            }
                            var activityWithStream = newlyDetectedActivity;
                            activityWithStream.hasPowerMeter = hasPowerMeter;
                            activityWithStream.stream = data.value;
                            activitiesWithStream.push(activityWithStream);
                        }
                    });
                    var notify = {
                        step: 'fetchedStreamsPercentage',
                        progress: 100
                    };
                    deferred.notify(notify);
                    deferred.resolve(activitiesWithStream);
                }, function (err) {
                }, function (notification) {
                    fetchedActivitiesProgress = fetchedActivitiesStreamCount / historyChangesOnPagesRode.added.length * 100;
                    var notify = {
                        step: 'fetchedStreamsPercentage',
                        progress: fetchedActivitiesProgress,
                        index: notification.index,
                        activityId: notification.value,
                    };
                    deferred.notify(notify);
                    fetchedActivitiesStreamCount++;
                });
            });
        }, function (err) {
            deferred.reject(err);
        }, function (progress) {
            deferred.notify(progress);
        });
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.httpPageGet = function (perPage, page) {
        return $.ajax('/athlete/training_activities?new_activity_only=false&per_page=' + perPage + '&page=' + page);
    };
    ActivitiesSynchronizer.prototype.fetchRawActivitiesRecursive = function (lastSyncDateTime, page, pagesToRead, pagesRidden, deferred, activitiesList) {
        var _this = this;
        if (!page) {
            page = 1;
        }
        if (!pagesToRead) {
            pagesToRead = 0;
        }
        if (!pagesRidden) {
            pagesRidden = 0;
        }
        if (!deferred) {
            deferred = Q.defer();
        }
        if (!activitiesList) {
            activitiesList = [];
        }
        var perPage = 20;
        var promiseActivitiesRequest = this.httpPageGet(perPage, page);
        var notify = {
            step: 'fetchActivitiesPercentage'
        };
        promiseActivitiesRequest.then(function (data, textStatus, jqXHR) {
            if (textStatus !== 'success') {
                deferred.reject('Unable to get models' + textStatus);
            }
            else {
                if (pagesToRead && pagesToRead === pagesRidden) {
                    console.log('[PagesRidden] Resolving with ' + activitiesList.length + ' activities found');
                    deferred.resolve(activitiesList);
                }
                else if (_.isEmpty(data.models)) {
                    console.log('[EndReached] Resolving with ' + activitiesList.length + ' activities found.');
                    _this._endReached = true;
                    deferred.resolve(activitiesList);
                }
                else {
                    notify.totalActivities = data.total;
                    activitiesList = _.flatten(_.union(activitiesList, data.models));
                    notify.progress = (activitiesList.length / ((pagesToRead && perPage) ? (pagesToRead * perPage) : notify.totalActivities)) * 100;
                    deferred.notify(notify);
                    setTimeout(function () {
                        _this.fetchRawActivitiesRecursive(lastSyncDateTime, page + 1, pagesToRead, pagesRidden + 1, deferred, activitiesList);
                    }, 50);
                }
            }
        }, function (data, textStatus, errorThrown) {
            var err = {
                method: 'ActivitiesSynchronizer.fetchRawActivitiesRecursive',
                page: page,
                data: data,
                textStatus: textStatus,
                errorThrown: errorThrown,
            };
            console.error(err);
            deferred.reject(err);
        });
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.fetchStreamByActivityId = function (activityId) {
        var deferred = Q.defer();
        var activityStreamUrl = "/activities/" + activityId + "/streams?stream_types[]=watts_calc&stream_types[]=watts&stream_types[]=velocity_smooth&stream_types[]=time&stream_types[]=distance&stream_types[]=cadence&stream_types[]=heartrate&stream_types[]=grade_smooth&stream_types[]=altitude&stream_types[]=latlng";
        var promiseActivityStream = $.ajax(activityStreamUrl);
        promiseActivityStream.then(function (data, textStatus, jqXHR) {
            deferred.notify(activityId);
            data.activityId = activityId;
            deferred.resolve(data);
        }, function (data, textStatus, errorThrown) {
            deferred.reject({
                method: 'ActivitiesSynchronizer.fetchStreamByActivityId',
                activityId: activityId,
                data: data,
                textStatus: textStatus,
                errorThrown: errorThrown,
            });
        });
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.clearSyncCache = function () {
        var _this = this;
        var promise = Helper.removeFromStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.computedActivities).then(function () {
            console.log('computedActivities removed from local storage');
            return Helper.removeFromStorage(_this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.lastSyncDateTime);
        }).then(function () {
            console.log('lastSyncDateTime removed from local storage');
            return Helper.removeFromStorage(_this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.syncWithAthleteProfile);
        }).then(function () {
            console.log('syncWithAthleteProfile removed from local storage');
        });
        return promise;
    };
    ActivitiesSynchronizer.prototype.fetchAndComputeGroupOfPages = function (lastSyncDateTime, fromPage, pagesToRead) {
        var _this = this;
        var deferred = Q.defer();
        this.fetchWithStream(lastSyncDateTime, fromPage, pagesToRead).then(function (activitiesWithStreams) {
            return _this._activitiesProcessor.compute(activitiesWithStreams);
        }, function (err) {
            deferred.reject(err);
            return null;
        }, function (progress) {
            if (progress) {
                progress.fromPage = fromPage;
                progress.toPage = fromPage + pagesToRead - 1;
                deferred.notify(progress);
            }
        }).then(function (computedActivities) {
            deferred.resolve(computedActivities);
        }, function (err) {
            deferred.reject(err);
        }, function (progress) {
            if (progress) {
                progress.fromPage = fromPage;
                progress.toPage = fromPage + pagesToRead - 1;
                deferred.notify(progress);
            }
        });
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.printGroupLimits = function (fromPage, pagesPerGroupToRead) {
        return '[' + fromPage + ' => ' + (fromPage - 1 + pagesPerGroupToRead) + ']';
    };
    ActivitiesSynchronizer.prototype.computeActivitiesByGroupsOfPages = function (lastSyncDateTime, fromPage, pagesPerGroupToRead, handledGroupCount, deferred) {
        var _this = this;
        if (!handledGroupCount) {
            handledGroupCount = 0;
        }
        if (!fromPage) {
            fromPage = 1;
        }
        if (!pagesPerGroupToRead) {
            pagesPerGroupToRead = ActivitiesSynchronizer.pagesPerGroupToRead;
        }
        if (!deferred) {
            deferred = Q.defer();
        }
        var computedActivitiesInGroup = null;
        if (this._endReached) {
            deferred.resolve(this._hasBeenComputedActivities);
        }
        else {
            this.fetchAndComputeGroupOfPages(lastSyncDateTime, fromPage, pagesPerGroupToRead).then(function (computedActivitiesPromised) {
                handledGroupCount++;
                computedActivitiesInGroup = computedActivitiesPromised;
                computedActivitiesPromised = null;
                console.log(computedActivitiesInGroup.length + '  activities computed in group ' + _this.printGroupLimits(fromPage, pagesPerGroupToRead), computedActivitiesInGroup);
                console.log('Group handled count: ' + handledGroupCount);
                return _this.getComputedActivitiesFromLocal();
            }).then(function (computedActivitiesStored) {
                if (computedActivitiesInGroup !== null && computedActivitiesInGroup.length > 0) {
                    if (_.isEmpty(computedActivitiesStored) || _.isEmpty(computedActivitiesStored.data)) {
                        computedActivitiesStored = {};
                        computedActivitiesStored.data = [];
                    }
                    _this._hasBeenComputedActivities = _.flatten(_.union(computedActivitiesInGroup, computedActivitiesStored.data));
                    _this._hasBeenComputedActivities = _.sortBy(_this._hasBeenComputedActivities, function (item) {
                        return (new Date(item.start_time)).getTime();
                    });
                    _this._hasBeenComputedActivities = _.uniq(_this._hasBeenComputedActivities, function (item) {
                        return item.id;
                    });
                    console.log('Updating computed activities to extension local storage.');
                    _this.saveComputedActivitiesToLocal(_this._hasBeenComputedActivities).then(function (pagesGroupSaved) {
                        console.log('Group ' + _this.printGroupLimits(fromPage, pagesPerGroupToRead) + ' saved to extension local storage, total count: ' + pagesGroupSaved.data.computedActivities.length + ' data: ', pagesGroupSaved);
                        var notify = {
                            step: 'savedComputedActivities',
                            progress: 100,
                            pageGroupId: handledGroupCount + 1,
                            browsedActivitiesCount: _this.totalRawActivityIds.length
                        };
                        deferred.notify(notify);
                        _this.computeActivitiesByGroupsOfPages(lastSyncDateTime, fromPage + pagesPerGroupToRead, pagesPerGroupToRead, handledGroupCount, deferred);
                        computedActivitiesInGroup = null;
                        computedActivitiesStored = null;
                    });
                }
                else {
                    console.log('Group ' + _this.printGroupLimits(fromPage, pagesPerGroupToRead) + ' handled');
                    var notify = {
                        step: 'savedComputedActivities',
                        progress: 100,
                        pageGroupId: handledGroupCount + 1,
                        browsedActivitiesCount: _this.totalRawActivityIds.length
                    };
                    deferred.notify(notify);
                    _this.computeActivitiesByGroupsOfPages(lastSyncDateTime, fromPage + pagesPerGroupToRead, pagesPerGroupToRead, handledGroupCount, deferred);
                    computedActivitiesInGroup = null;
                    computedActivitiesStored = null;
                }
            }, function (err) {
                deferred.reject(err);
            }, function (progress) {
                deferred.notify(progress);
            });
        }
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.sync = function () {
        var _this = this;
        var deferred = Q.defer();
        var syncNotify = {};
        this.initializeForSync();
        this.getLastSyncDateFromLocal().then(function (savedLastSyncDateTime) {
            var computeGroupedActivitiesPromise = null;
            var lastSyncDateTime = (savedLastSyncDateTime.data && _.isNumber(savedLastSyncDateTime.data)) ? new Date(savedLastSyncDateTime.data) : null;
            if (lastSyncDateTime) {
                computeGroupedActivitiesPromise = _this.computeActivitiesByGroupsOfPages(lastSyncDateTime);
            }
            else {
                computeGroupedActivitiesPromise = _this.clearSyncCache().then(function () {
                    return _this.computeActivitiesByGroupsOfPages(lastSyncDateTime);
                });
            }
            return computeGroupedActivitiesPromise;
        }).then(function () {
            return _this.getComputedActivitiesFromLocal();
        }).then(function (computedActivitiesStored) {
            if (computedActivitiesStored && computedActivitiesStored.data) {
                var historyChangesOnPagesRode = ActivitiesSynchronizer.findDeletedActivities(_this.totalRawActivityIds, computedActivitiesStored.data);
                _this.appendGlobalHistoryChanges(historyChangesOnPagesRode);
                if (_this._globalHistoryChanges.edited.length > 0) {
                    _.each(_this._globalHistoryChanges.edited, function (editData) {
                        var activityToEdit = _.findWhere(computedActivitiesStored.data, { id: editData.id });
                        activityToEdit.name = editData.name;
                        activityToEdit.type = editData.type;
                        activityToEdit.display_type = editData.display_type;
                    });
                }
                if (_this._globalHistoryChanges.deleted.length > 0) {
                    _.each(_this._globalHistoryChanges.deleted, function (deleteId) {
                        computedActivitiesStored.data = _.without(computedActivitiesStored.data, _.findWhere(computedActivitiesStored.data, {
                            id: deleteId
                        }));
                    });
                }
                return _this.saveComputedActivitiesToLocal(computedActivitiesStored.data);
            }
            else {
                deferred.reject("You tried to edit/delete from local history without having local data ?!");
                return null;
            }
        }).then(function () {
            return _this.saveLastSyncDateToLocal((new Date()).getTime());
        }).then(function (saved) {
            syncNotify.step = 'updatingLastSyncDateTime';
            syncNotify.progress = 100;
            deferred.notify(syncNotify);
            console.log('Last sync date time saved: ', new Date(saved.data.lastSyncDateTime));
            var syncedAthleteProfile = {
                userGender: _this.userSettings.userGender,
                userMaxHr: _this.userSettings.userMaxHr,
                userRestHr: _this.userSettings.userRestHr,
                userWeight: _this.userSettings.userWeight,
                userFTP: _this.userSettings.userFTP
            };
            return _this.saveSyncedAthleteProfile(syncedAthleteProfile);
        }).then(function (saved) {
            console.log('Sync With Athlete Profile done');
            var syncResult = {
                globalHistoryChanges: _this._globalHistoryChanges,
                computedActivities: saved.data.computedActivities,
                lastSyncDateTime: saved.data.lastSyncDateTime,
                syncWithAthleteProfile: saved.data.syncWithAthleteProfile,
            };
            deferred.resolve(syncResult);
        }, function (err) {
            deferred.reject(err);
        }, function (progress) {
            syncNotify = {
                step: progress.step,
                progress: progress.progress,
                index: progress.index,
                activityId: progress.activityId,
                fromPage: progress.fromPage,
                toPage: progress.toPage,
                pageGroupId: (progress.pageGroupId) ? progress.pageGroupId : ((syncNotify && syncNotify.pageGroupId) ? syncNotify.pageGroupId : 1),
                browsedActivitiesCount: (progress.browsedActivitiesCount) ? progress.browsedActivitiesCount : ((syncNotify && syncNotify.browsedActivitiesCount) ? syncNotify.browsedActivitiesCount : 0),
                totalActivities: (progress.totalActivities) ? progress.totalActivities : ((syncNotify && syncNotify.totalActivities) ? syncNotify.totalActivities : null)
            };
            deferred.notify(syncNotify);
        });
        return deferred.promise;
    };
    ActivitiesSynchronizer.prototype.initializeForSync = function () {
        this._hasBeenComputedActivities = null;
        this._globalHistoryChanges = {
            added: [],
            deleted: [],
            edited: []
        };
        this._endReached = false;
        this.totalRawActivityIds = [];
    };
    ActivitiesSynchronizer.prototype.saveSyncedAthleteProfile = function (syncedAthleteProfile) {
        return Helper.setToStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.syncWithAthleteProfile, syncedAthleteProfile);
    };
    ActivitiesSynchronizer.prototype.saveLastSyncDateToLocal = function (timestamp) {
        return Helper.setToStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.lastSyncDateTime, timestamp);
    };
    ActivitiesSynchronizer.prototype.getLastSyncDateFromLocal = function () {
        return Helper.getFromStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.lastSyncDateTime);
    };
    ActivitiesSynchronizer.prototype.saveComputedActivitiesToLocal = function (computedActivities) {
        return Helper.setToStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.computedActivities, computedActivities);
    };
    ActivitiesSynchronizer.prototype.getComputedActivitiesFromLocal = function () {
        return Helper.getFromStorage(this.extensionId, StorageManager.storageLocalType, ActivitiesSynchronizer.computedActivities);
    };
    Object.defineProperty(ActivitiesSynchronizer.prototype, "activitiesProcessor", {
        get: function () {
            return this._activitiesProcessor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivitiesSynchronizer.prototype, "hasBeenComputedActivities", {
        get: function () {
            return this._hasBeenComputedActivities;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivitiesSynchronizer.prototype, "globalHistoryChanges", {
        get: function () {
            return this._globalHistoryChanges;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActivitiesSynchronizer.prototype, "endReached", {
        get: function () {
            return this._endReached;
        },
        enumerable: true,
        configurable: true
    });
    ActivitiesSynchronizer.lastSyncDateTime = 'lastSyncDateTime';
    ActivitiesSynchronizer.computedActivities = 'computedActivities';
    ActivitiesSynchronizer.syncWithAthleteProfile = 'syncWithAthleteProfile';
    ActivitiesSynchronizer.pagesPerGroupToRead = 3;
    return ActivitiesSynchronizer;
}());
