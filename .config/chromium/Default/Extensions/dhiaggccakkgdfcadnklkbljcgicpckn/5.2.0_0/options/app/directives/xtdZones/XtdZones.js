var XtdZones = (function () {
    function XtdZones($scope, chromeStorageService, $mdDialog, $location, $anchorScroll) {
        this.$scope = $scope;
        this.chromeStorageService = chromeStorageService;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
        this.$anchorScroll = $anchorScroll;
        $scope.addZone = function ($event) {
            if ($scope.xtdZones.length >= XtdZones.maxZonesCount) {
                $mdDialog.show($mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Oups')
                    .textContent('You can\'t add more than ' + XtdZones.maxZonesCount + ' zones...')
                    .ok('Got it!')
                    .targetEvent($event));
            }
            else {
                var oldLastZone = $scope.xtdZones[$scope.xtdZones.length - 1];
                var betweenValue = parseInt(((oldLastZone.from + oldLastZone.to) / 2).toFixed(0));
                var newLastZone = {
                    from: betweenValue,
                    to: oldLastZone.to
                };
                $scope.xtdZones[$scope.xtdZones.length - 1].to = betweenValue;
                $scope.xtdZones.push(newLastZone);
                $scope.scrollToBottom();
            }
        };
        $scope.removeZone = function ($event, zoneId) {
            if ($scope.xtdZones.length <= XtdZones.minZonesCount) {
                $mdDialog.show($mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Oups')
                    .textContent('You can\'t remove more than ' + XtdZones.minZonesCount + ' zones...')
                    .ok('Got it!')
                    .targetEvent($event));
            }
            else {
                if (zoneId === 0) {
                    $scope.xtdZones.splice(zoneId, 1);
                }
                else if (zoneId && zoneId !== $scope.xtdZones.length - 1) {
                    $scope.xtdZones[zoneId + 1].from = $scope.xtdZones[zoneId - 1].to;
                    $scope.xtdZones.splice(zoneId, 1);
                }
                else {
                    $scope.xtdZones.pop();
                    $scope.scrollToBottom();
                }
            }
        };
        $scope.resetZone = function ($event) {
            var confirm = $mdDialog.confirm()
                .title('Reset zones')
                .textContent('You are going to reset ' + $scope.xtdDataSelected.name + ' zones to default factory values. Are you sure?')
                .targetEvent($event)
                .ok('Yes. Reset')
                .cancel('cancel');
            $mdDialog.show(confirm).then(function () {
                angular.copy(_.propertyOf(userSettings.zones)($scope.xtdDataSelected.value), $scope.xtdZones);
                $scope.saveZones();
            });
        };
        $scope.saveZones = function ($event) {
            if (!$scope.areZonesCompliant($scope.xtdZones)) {
                alert('Zones are not compliant');
                return;
            }
            if (!_.isUndefined($scope.xtdZones)) {
                chromeStorageService.fetchUserSettings(function (userSettingsSynced) {
                    var zones = userSettingsSynced.zones;
                    zones[$scope.xtdDataSelected.value] = angular.fromJson(angular.toJson($scope.xtdZones));
                    chrome.storage.sync.set(userSettingsSynced, function () {
                        $mdDialog.show($mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Saved !')
                            .textContent('Your ' + $scope.xtdZones.length + ' "' + $scope.xtdDataSelected.name + ' zones" have been saved.')
                            .ok('Got it!')
                            .targetEvent($event));
                        chromeStorageService.updateUserSetting('localStorageMustBeCleared', true, function () {
                            console.log('localStorageMustBeCleared has been updated to: ' + true);
                        });
                    });
                });
            }
        };
        $scope.setupStep = function ($event) {
            $mdDialog.show({
                controller: function ($scope, $mdDialog, localStep, localZoneType) {
                    $scope.step = localStep;
                    $scope.zoneType = localZoneType;
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.answer = function (stepChoosen) {
                        $mdDialog.hide(stepChoosen);
                    };
                },
                templateUrl: 'directives/templates/dialogs/stepDialog.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose: true,
                fullscreen: false,
                locals: {
                    localStep: $scope.xtdDataSelected.step,
                    localZoneType: $scope.xtdDataSelected.name
                },
            }).then(function (stepChoosen) {
                if (stepChoosen) {
                    $scope.xtdDataSelected.step = stepChoosen;
                }
            });
        };
        $scope.export = function ($event) {
            var exportData = angular.toJson($scope.xtdZones);
            var exportPrompt = $mdDialog.prompt()
                .title('Exporting ' + $scope.xtdDataSelected.name + ' zones')
                .textContent('Copy data inside field.')
                .ariaLabel('Copy data inside field.')
                .initialValue(exportData)
                .targetEvent($event)
                .ok('Okay!');
            $mdDialog.show(exportPrompt);
        };
        $scope.import = function ($event) {
            var importPrompt = $mdDialog.prompt()
                .title('Importing ' + $scope.xtdDataSelected.name + ' zones')
                .textContent('Paste exported zones in input field.')
                .ariaLabel('Paste exported zones in input field.')
                .initialValue('')
                .placeholder('Enter here something like [{ "from": a, "to": b }, { "from": b, "to": c }, { "from": c, "to": d }]')
                .targetEvent($event)
                .ok('Import');
            $mdDialog.show(importPrompt)
                .then(function (importData) {
                if (importData) {
                    try {
                        var jsonImportData = angular.fromJson(importData);
                        if ($scope.areZonesCompliant(jsonImportData)) {
                            $scope.xtdZones = jsonImportData;
                            $scope.saveZones();
                        }
                        else {
                            throw new Error('not compliant');
                        }
                    }
                    catch (e) {
                        $mdDialog.show($mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Oups')
                            .textContent($scope.xtdDataSelected.name + ' zones data is not well formated or zones are upper than ' + XtdZones.maxZonesCount)
                            .ok('Got it!')
                            .targetEvent($event));
                        return;
                    }
                }
            });
        };
        $scope.areZonesCompliant = function (zones) {
            if (!zones) {
                return false;
            }
            if (zones.length > XtdZones.maxZonesCount) {
                return false;
            }
            if (zones.length < XtdZones.minZonesCount) {
                return false;
            }
            for (var i = 0; i < zones.length; i++) {
                if (i === 0) {
                    if (zones[i].to != zones[i + 1].from) {
                        return false;
                    }
                }
                else if (i < (zones.length - 1)) {
                    if (zones[i].to != zones[i + 1].from || zones[i].from != zones[i - 1].to) {
                        return false;
                    }
                }
                else {
                    if (zones[i].from != zones[i - 1].to) {
                        return false;
                    }
                }
            }
            return true;
        };
        $scope.onZoneChange = function (zoneId, previousZone, newZone) {
            var fieldHasChanged = $scope.whichFieldHasChanged(previousZone, newZone);
            if (_.isUndefined(fieldHasChanged)) {
                return;
            }
            if (zoneId === 0) {
                $scope.handleToChange(zoneId);
            }
            else if (zoneId < $scope.xtdZones.length - 1) {
                if (fieldHasChanged === 'to') {
                    $scope.handleToChange(zoneId);
                }
                else if (fieldHasChanged === 'from') {
                    $scope.handleFromChange(zoneId);
                }
            }
            else {
                $scope.handleFromChange(zoneId);
            }
        };
        $scope.whichFieldHasChanged = function (previousZone, newZone) {
            if (previousZone.from !== newZone.from) {
                return 'from';
            }
            if (previousZone.to !== newZone.to) {
                return 'to';
            }
        };
        $scope.handleToChange = function (zoneId) {
            $scope.xtdZones[zoneId + 1].from = $scope.xtdZones[zoneId].to;
        };
        $scope.handleFromChange = function (zoneId) {
            $scope.xtdZones[zoneId - 1].to = $scope.xtdZones[zoneId].from;
        };
        $scope.scrollToBottom = function () {
            setTimeout(function () {
                $anchorScroll($location.hash('tools_bottom').hash());
            });
        };
    }
    XtdZones.maxZonesCount = 50;
    XtdZones.minZonesCount = 3;
    XtdZones.$inject = ['$scope', 'ChromeStorageService', '$mdDialog', '$location', '$anchorScroll'];
    return XtdZones;
}());
app.directive('xtdZones', [function () {
        return {
            templateUrl: 'directives/xtdZones/templates/xtdZones.html',
            scope: {
                xtdZones: "=",
                xtdDataSelected: "="
            },
            controller: XtdZones
        };
    }]);
