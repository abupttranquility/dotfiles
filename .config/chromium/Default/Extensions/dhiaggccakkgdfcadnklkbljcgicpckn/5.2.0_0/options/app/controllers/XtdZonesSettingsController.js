var XtdZonesSettingsController = (function () {
    function XtdZonesSettingsController($scope, $location, $routeParams, chromeStorageService) {
        $scope.xtdListOptions = [{
                name: 'Cycling Speed',
                value: 'speed',
                units: 'KPH',
                step: 0.1,
                min: 0,
                max: 9999,
                hasConvertion: true
            }, {
                name: 'Running Pace',
                value: 'pace',
                units: 'Seconds',
                step: 1,
                min: 0,
                max: 9999,
                hasConvertion: true
            }, {
                name: 'Cycling Power',
                value: 'power',
                units: 'Watts',
                step: 1,
                min: 0,
                max: 9999
            }, {
                name: 'Cycling Cadence',
                value: 'cyclingCadence',
                units: 'RPM',
                step: 1,
                min: 0,
                max: 9999
            }, {
                name: 'Running Cadence',
                value: 'runningCadence',
                units: 'SPM',
                step: 0.1,
                min: 0,
                max: 9999
            }, {
                name: 'Grade',
                value: 'grade',
                units: '%',
                step: 0.1,
                min: -9999,
                max: 9999
            }, {
                name: 'Elevation',
                value: 'elevation',
                units: 'm',
                step: 5,
                min: 0,
                max: 9999
            }, {
                name: 'Ascent speed',
                value: 'ascent',
                units: 'Vm/h',
                step: 5,
                min: 0,
                max: 9999
            }];
        $scope.switchZonesFromXtdItem = function (xtdData) {
            $scope.xtdData = xtdData;
            $scope.xtdZones = _.propertyOf($scope.zones)($scope.xtdData.value);
            $scope.$apply();
        };
        chromeStorageService.fetchUserSettings(function (userSettingsSynced) {
            $scope.zones = userSettingsSynced.zones;
            var zoneValue = $routeParams.zoneValue;
            var item = _.findWhere($scope.xtdListOptions, {
                value: zoneValue
            });
            $scope.switchZonesFromXtdItem(item);
        });
    }
    XtdZonesSettingsController.$inject = ['$scope', '$location', '$routeParams', 'ChromeStorageService'];
    return XtdZonesSettingsController;
}());
app.controller("XtdZonesSettingsController", XtdZonesSettingsController);
