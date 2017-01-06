var RestoreHistoryController = (function () {
    function RestoreHistoryController(chromeStorageService, $scope, $window) {
        this._chromeStorageService = chromeStorageService;
        this._windowService = $window;
    }
    Object.defineProperty(RestoreHistoryController.prototype, "chromeStorageService", {
        get: function () {
            return this._chromeStorageService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RestoreHistoryController.prototype, "windowService", {
        get: function () {
            return this._windowService;
        },
        enumerable: true,
        configurable: true
    });
    RestoreHistoryController.$inject = ['ChromeStorageService', '$scope', '$window'];
    return RestoreHistoryController;
}());
app.directive('restoreHistory', [function () {
        return {
            template: '<div><input type="file"/><md-button class="md-raised md-primary" ng-click="restore()">Restore</md-button></div>',
            controller: RestoreHistoryController,
            link: function ($scope, $element, $attributes, restoreHistoryController) {
                $scope.file = null;
                $element.bind("change", function (changeEvent) {
                    $scope.file = changeEvent.target.files[0];
                });
                $scope.restore = function () {
                    if (!$scope.file) {
                        alert('You must provide a backup file (.json)');
                    }
                    else {
                        var reader = new FileReader();
                        reader.readAsText($scope.file);
                        reader.onload = function (loadEvent) {
                            $scope.$apply(function () {
                                if (_.isEmpty(loadEvent.target.result)) {
                                    alert("No data to restore here");
                                    return;
                                }
                                var restoredHistoryObject = angular.fromJson(loadEvent.target.result);
                                if (_.isEmpty(restoredHistoryObject)) {
                                    alert("No data to restore here");
                                    return;
                                }
                                if (!restoredHistoryObject.pluginVersion || restoredHistoryObject.pluginVersion !== chrome.runtime.getManifest().version) {
                                    alert("Backup file version do not match with the plugin version installed:\n\nFile version: " + restoredHistoryObject.pluginVersion + '\nCurrent plugin version:' + chrome.runtime.getManifest().version + '\n\nRedo a full sync or load compliant backup file.');
                                    return;
                                }
                                if (!restoredHistoryObject.lastSyncDateTime || !_.isNumber(restoredHistoryObject.lastSyncDateTime) ||
                                    _.isEmpty(restoredHistoryObject.syncWithAthleteProfile) ||
                                    _.isEmpty(restoredHistoryObject.computedActivities)) {
                                    alert("Missing fields.\n\nRedo a full sync or load compliant backup file.");
                                    return;
                                }
                                restoreHistoryController.chromeStorageService.setToLocalStorage('lastSyncDateTime', restoredHistoryObject.lastSyncDateTime).then(function () {
                                    return restoreHistoryController.chromeStorageService.setToLocalStorage('syncWithAthleteProfile', restoredHistoryObject.syncWithAthleteProfile);
                                }).then(function () {
                                    return restoreHistoryController.chromeStorageService.setToLocalStorage('computedActivities', restoredHistoryObject.computedActivities);
                                }).then(function () {
                                    console.log('lastSyncDateTime restored');
                                    console.log('syncWithAthleteProfile restored');
                                    console.log('computedActivities restored');
                                    restoreHistoryController.windowService.location.reload();
                                }, function (errors) {
                                    console.error(errors);
                                    alert('Restore process failed. Show developer console to view errors (F12)' + errors);
                                });
                            });
                        };
                    }
                };
            }
        };
    }]);
