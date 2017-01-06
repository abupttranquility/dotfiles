var HrrZonesSettingsController = (function () {
    function HrrZonesSettingsController($scope, chromeStorageService, AvoidInputKeysService) {
        chromeStorageService.fetchUserSettings(function (userSettingsSynced) {
            $scope.userMaxHr = userSettingsSynced.userMaxHr;
            $scope.userRestHr = userSettingsSynced.userRestHr;
            $scope.zones = userSettingsSynced.userHrrZones;
            $scope.$apply();
        });
        $scope.localStorageMustBeCleared = function () {
            chromeStorageService.updateUserSetting('localStorageMustBeCleared', true, function () {
                console.log('localStorageMustBeCleared has been updated to ' + true);
            });
        };
        $scope.avoidInputKeyEdit = function (keyboardEvent) {
            AvoidInputKeysService.apply(keyboardEvent);
        };
    }
    HrrZonesSettingsController.$inject = ['$scope', 'ChromeStorageService', 'AvoidInputKeysService'];
    return HrrZonesSettingsController;
}());
app.controller("HrrZonesSettingsController", HrrZonesSettingsController);
