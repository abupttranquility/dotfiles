var ProfileConfiguredRibbon = (function () {
    function ProfileConfiguredRibbon($scope, chromeStorageService, $location, $window) {
        this.$scope = $scope;
        this.chromeStorageService = chromeStorageService;
        this.$location = $location;
        this.$window = $window;
        $scope.isProfileConfigured = true;
        chromeStorageService.getProfileConfigured().then(function (profileConfigured) {
            $scope.isProfileConfigured = profileConfigured || !_.isEmpty(profileConfigured);
        });
        $scope.checkLocalSyncedAthleteProfileEqualsRemote = function () {
            chromeStorageService.fetchUserSettings().then(function (userSettings) {
                if (!userSettings) {
                    return null;
                }
                var remoteAthleteProfile = {
                    userGender: userSettings.userGender,
                    userMaxHr: userSettings.userMaxHr,
                    userRestHr: userSettings.userRestHr,
                    userFTP: userSettings.userFTP,
                    userWeight: userSettings.userWeight,
                };
                chromeStorageService.getLocalSyncedAthleteProfile().then(function (localSyncedAthleteProfile) {
                    if (!_.isEmpty(localSyncedAthleteProfile)) {
                        var remoteEqualsLocal = ProfileConfiguredRibbon.remoteAthleteProfileEqualsLocal(remoteAthleteProfile, localSyncedAthleteProfile);
                        $scope.showHistoryNonConsistent = !remoteEqualsLocal;
                    }
                });
            });
        };
        if (!StorageManager.getCookie('hide_history_non_consistent')) {
            $scope.checkLocalSyncedAthleteProfileEqualsRemote();
        }
        $scope.hideHistoryNonConsistent = function () {
            $scope.showHistoryNonConsistent = false;
            StorageManager.setCookieSeconds('hide_history_non_consistent', 'true', 24 * 3600);
        };
        $scope.goToAthleteSettings = function () {
            $location.path(routeMap.athleteSettingsRoute);
        };
        $scope.setProfileConfiguredAndHide = function () {
            chromeStorageService.getProfileConfigured().then(function (isConfigured) {
                if (!isConfigured) {
                    chromeStorageService.setProfileConfigured(true).then(function () {
                        console.log('Profile configured');
                        $scope.isProfileConfigured = true;
                    });
                }
                else {
                    $scope.isProfileConfigured = isConfigured;
                }
            });
        };
        $scope.syncNow = function (forceSync) {
            chrome.tabs.getCurrent(function (tab) {
                $window.open('https://www.strava.com/dashboard?stravistixSync=true&forceSync=' + forceSync + '&sourceTabId=' + tab.id, '_blank', 'width=700, height=675, location=0');
            });
        };
        $scope.$on(AthleteSettingsController.changedAthleteProfileMessage, function () {
            $scope.checkLocalSyncedAthleteProfileEqualsRemote();
        });
    }
    ProfileConfiguredRibbon.remoteAthleteProfileEqualsLocal = function (remoteAthleteProfile, localAthleteProfile) {
        var remoteEqualsLocal = true;
        if (remoteAthleteProfile.userGender !== localAthleteProfile.userGender ||
            remoteAthleteProfile.userMaxHr !== localAthleteProfile.userMaxHr ||
            remoteAthleteProfile.userRestHr !== localAthleteProfile.userRestHr ||
            remoteAthleteProfile.userFTP !== localAthleteProfile.userFTP ||
            remoteAthleteProfile.userWeight !== localAthleteProfile.userWeight) {
            remoteEqualsLocal = false;
        }
        return remoteEqualsLocal;
    };
    ProfileConfiguredRibbon.$inject = ['$scope', 'ChromeStorageService', '$location', '$window'];
    return ProfileConfiguredRibbon;
}());
app.directive('profileConfiguredRibbon', [function () {
        return {
            controller: ProfileConfiguredRibbon,
            templateUrl: 'directives/templates/profileConfiguredRibbon.html'
        };
    }]);
