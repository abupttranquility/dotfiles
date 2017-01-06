var HrrZones = (function () {
    function HrrZones($scope, chromeStorageService, $mdDialog, $location, $anchorScroll) {
        this.$scope = $scope;
        this.chromeStorageService = chromeStorageService;
        this.$mdDialog = $mdDialog;
        this.$location = $location;
        this.$anchorScroll = $anchorScroll;
        $scope.step = 0.1;
        $scope.addHrZone = function ($event) {
            if ($scope.hrrZones.length >= HrrZones.maxHrZonesCount) {
                $mdDialog.show($mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Oups')
                    .textContent('You can\'t add more than ' + HrrZones.maxHrZonesCount + ' zones...')
                    .ok('Got it!')
                    .targetEvent($event));
            }
            else {
                var oldLastHrZone = $scope.hrrZones[$scope.hrrZones.length - 1];
                var betweenHrrValue = parseInt(((oldLastHrZone.fromHrr + oldLastHrZone.toHrr) / 2).toFixed(0));
                var newLastHrZone = {
                    "fromHrr": betweenHrrValue,
                    "toHrr": oldLastHrZone.toHrr
                };
                $scope.hrrZones[$scope.hrrZones.length - 1].toHrr = betweenHrrValue;
                $scope.hrrZones.push(newLastHrZone);
                $scope.scrollToBottom();
            }
        };
        $scope.removeHrZone = function ($event, hrrZoneId) {
            if ($scope.hrrZones.length <= HrrZones.minHrZonesCount) {
                $mdDialog.show($mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Oups')
                    .textContent('You can\'t remove more than ' + HrrZones.minHrZonesCount + ' zones...')
                    .ok('Got it!')
                    .targetEvent($event));
            }
            else {
                if (hrrZoneId === 0) {
                    $scope.hrrZones.splice(hrrZoneId, 1);
                }
                else if (hrrZoneId && hrrZoneId !== $scope.hrrZones.length - 1) {
                    $scope.hrrZones[hrrZoneId + 1].fromHrr = $scope.hrrZones[hrrZoneId - 1].toHrr;
                    $scope.hrrZones.splice(hrrZoneId, 1);
                }
                else {
                    $scope.hrrZones.pop();
                    $scope.scrollToBottom();
                }
            }
        };
        $scope.resetHrZone = function ($event) {
            var confirm = $mdDialog.confirm()
                .title('Reset zones')
                .textContent('You are going to reset your custom heart rate reserve zones to default factory values. Are you sure?')
                .targetEvent($event)
                .ok('Yes. Reset')
                .cancel('cancel');
            $mdDialog.show(confirm).then(function () {
                angular.copy(userSettings.userHrrZones, $scope.hrrZones);
                $scope.saveHrZones();
            });
        };
        $scope.saveHrZones = function ($event) {
            if (!$scope.areHrrZonesCompliant($scope.hrrZones)) {
                alert('Zones are not compliant');
                return;
            }
            if (!_.isUndefined($scope.hrrZones)) {
                chromeStorageService.updateUserSetting('userHrrZones', angular.fromJson(angular.toJson($scope.hrrZones)), function () {
                    console.log('userHrrZones has been updated to: ' + angular.toJson($scope.hrrZones));
                    $mdDialog.show($mdDialog.alert()
                        .clickOutsideToClose(true)
                        .title('Saved !')
                        .textContent('Your ' + $scope.hrrZones.length + ' Heartrate reserve zones" have been saved.')
                        .ok('Got it!')
                        .targetEvent($event));
                    chromeStorageService.updateUserSetting('localStorageMustBeCleared', true, function () {
                        console.log('localStorageMustBeCleared has been updated to: ' + true);
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
                    localStep: $scope.step,
                    localZoneType: 'Heartrate Reserve'
                },
            }).then(function (stepChoosen) {
                if (stepChoosen) {
                    $scope.step = stepChoosen;
                }
            });
        };
        $scope.export = function ($event) {
            var exportData = angular.toJson($scope.hrrZones);
            var exportPrompt = $mdDialog.prompt()
                .title('Exporting Heartrate Reserve Zones')
                .textContent('Copy data inside field.')
                .ariaLabel('Copy data inside field.')
                .initialValue(exportData)
                .targetEvent($event)
                .ok('Okay!');
            $mdDialog.show(exportPrompt);
        };
        $scope.import = function ($event) {
            var importPrompt = $mdDialog.prompt()
                .title('Importing Heartrate Reserve Zones')
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
                        if ($scope.areHrrZonesCompliant(jsonImportData)) {
                            $scope.hrrZones = jsonImportData;
                            $scope.saveHrZones();
                        }
                        else {
                            throw new Error('not compliant');
                        }
                    }
                    catch (e) {
                        $mdDialog.show($mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Oups')
                            .textContent('Importing Heartrate Reserve Zones data is not well formated or zones are upper than ' + HrrZones.maxHrZonesCount)
                            .ok('Got it!')
                            .targetEvent($event));
                        return;
                    }
                }
            });
        };
        $scope.showHelper = function ($event) {
            $mdDialog.show({
                controller: function ($scope, $mdDialog, userMaxHr, userRestHr) {
                    $scope.userMaxHr = userMaxHr;
                    $scope.userRestHr = userRestHr;
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                },
                templateUrl: 'directives/hrrZones/templates/hrrZonesHelper.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    userMaxHr: $scope.userMaxHr,
                    userRestHr: $scope.userRestHr
                },
                clickOutsideToClose: true,
                fullscreen: false
            });
        };
        $scope.areHrrZonesCompliant = function (hrrZones) {
            if (!hrrZones) {
                return false;
            }
            if (hrrZones.length > HrrZones.maxHrZonesCount) {
                return false;
            }
            if (hrrZones.length < HrrZones.minHrZonesCount) {
                return false;
            }
            for (var i = 0; i < hrrZones.length; i++) {
                if (i === 0) {
                    if (hrrZones[i].toHrr != hrrZones[i + 1].fromHrr) {
                        return false;
                    }
                }
                else if (i < (hrrZones.length - 1)) {
                    if (hrrZones[i].toHrr != hrrZones[i + 1].fromHrr || hrrZones[i].fromHrr != hrrZones[i - 1].toHrr) {
                        return false;
                    }
                }
                else {
                    if (hrrZones[i].fromHrr != hrrZones[i - 1].toHrr) {
                        return false;
                    }
                }
            }
            return true;
        };
        $scope.onZoneChange = function (hrrZoneId, previousHrrZone, newHrrZone) {
            var fieldHasChanged = $scope.whichFieldHasChanged(previousHrrZone, newHrrZone);
            if (_.isUndefined(fieldHasChanged)) {
                return;
            }
            if (hrrZoneId === 0) {
                $scope.handleToHrrChange(hrrZoneId);
            }
            else if (hrrZoneId < $scope.hrrZones.length - 1) {
                if (fieldHasChanged === 'toHrr') {
                    $scope.handleToHrrChange(hrrZoneId);
                }
                else if (fieldHasChanged === 'fromHrr') {
                    $scope.handleFromHrrChange(hrrZoneId);
                }
            }
            else {
                $scope.handleFromHrrChange(hrrZoneId);
            }
        };
        $scope.whichFieldHasChanged = function (previousHrZone, newHrZone) {
            if (previousHrZone.fromHrr !== newHrZone.fromHrr) {
                return 'fromHrr';
            }
            if (previousHrZone.toHrr !== newHrZone.toHrr) {
                return 'toHrr';
            }
        };
        $scope.handleToHrrChange = function (hrrZoneId) {
            $scope.hrrZones[hrrZoneId + 1].fromHrr = $scope.hrrZones[hrrZoneId].toHrr;
        };
        $scope.handleFromHrrChange = function (hrrZoneId) {
            $scope.hrrZones[hrrZoneId - 1].toHrr = $scope.hrrZones[hrrZoneId].fromHrr;
        };
        $scope.scrollToBottom = function () {
            setTimeout(function () {
                $anchorScroll($location.hash('tools_bottom').hash());
            });
        };
    }
    HrrZones.maxHrZonesCount = 50;
    HrrZones.minHrZonesCount = 3;
    HrrZones.$inject = ['$scope', 'ChromeStorageService', '$mdDialog', '$location', '$anchorScroll'];
    return HrrZones;
}());
app.directive('hrrZones', [function () {
        return {
            templateUrl: 'directives/hrrZones/templates/hrrZones.html',
            scope: {
                hrrZones: "=",
                userMaxHr: "@userMaxHr",
                userRestHr: "@userRestHr"
            },
            controller: HrrZones
        };
    }]);
