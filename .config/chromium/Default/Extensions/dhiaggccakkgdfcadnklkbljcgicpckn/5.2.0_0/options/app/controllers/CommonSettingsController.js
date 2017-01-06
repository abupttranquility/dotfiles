var CommonSettingsController = (function () {
    function CommonSettingsController($scope, CommonSettingsService, chromeStorageService, $location, $mdDialog, $sce) {
        $scope.sections = CommonSettingsService.provideSections();
        chromeStorageService.fetchUserSettings(function (userSettingsSynced) {
            $scope.userMaxHr = userSettingsSynced.userMaxHr;
            $scope.userRestHr = userSettingsSynced.userRestHr;
            $scope.userFTP = userSettingsSynced.userFTP;
            _.each($scope.sections, function (section) {
                _.each(section.sectionContent, function (option) {
                    if (option.optionType === 'checkbox') {
                        option.active = _.propertyOf(userSettingsSynced)(option.optionKey);
                        if (option.optionEnableSub) {
                            _.each(option.optionEnableSub, function (subKey) {
                                $scope.displaySubOption(subKey, _.propertyOf(userSettingsSynced)(option.optionKey));
                            });
                        }
                    }
                    else if (option.optionType === 'list') {
                        option.active = _.findWhere(option.optionList, {
                            key: _.propertyOf(userSettingsSynced)(option.optionKey)
                        });
                    }
                    else if (option.optionType === 'number') {
                        option.value = _.propertyOf(userSettingsSynced)(option.optionKey);
                    }
                    else {
                        console.error('Option type not supported');
                    }
                });
            });
            $scope.$apply();
        });
        $scope.toggleCheckOption = function (option) {
            chromeStorageService.updateUserSetting(option.optionKey, option.active, function () {
                console.log(option.optionKey + ' has been updated to ' + option.active);
            });
            if (option.optionEnableSub) {
                _.each(option.optionEnableSub, function (subKey) {
                    $scope.displaySubOption(subKey, option.active);
                });
            }
        };
        $scope.displaySubOption = function (subOptionKey, show) {
            _.each($scope.sections, function (section) {
                var optionFound = _.findWhere(section.sectionContent, {
                    optionKey: subOptionKey
                });
                if (optionFound) {
                    optionFound.hidden = !show;
                }
            });
        };
        $scope.toggleSelectOption = function (option) {
            chromeStorageService.updateUserSetting(option.optionKey, option.active.key, function () {
                console.log(option.optionKey + ' has been updated to ' + option.active);
            });
        };
        $scope.toggleIntegerOption = function (option) {
            if (_.isNull(option.value) || _.isUndefined(option.value)) {
                chromeStorageService.fetchUserSettings(function (userSettings) {
                    var resetValue = _.propertyOf(userSettings)(option.optionKey);
                    console.log(option.optionKey + ' value not compliant, Reset to  ' + resetValue);
                    option.value = resetValue;
                });
            }
            else {
                chromeStorageService.updateUserSetting(option.optionKey, option.value, function () {
                    console.log(option.optionKey + ' has been updated to ' + option.value);
                });
            }
        };
        $scope.displayOptionHelper = function (optionKeyParam) {
            var option = null;
            _.each($scope.sections, function (section) {
                var optionSearch = _.findWhere(section.sectionContent, {
                    optionKey: optionKeyParam
                });
                if (optionSearch) {
                    option = optionSearch;
                }
            });
            if (option) {
                $mdDialog.show({
                    controller: function ($scope) {
                        $scope.title = option.optionTitle;
                        $scope.htmlContent = $sce.trustAsHtml(option.optionHtml);
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                    },
                    templateUrl: 'views/modals/settingHint.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            }
        };
        var viewOptionHelperId = $location.search().viewOptionHelperId;
        if (!_.isUndefined(viewOptionHelperId)) {
            $scope.displayOptionHelper(viewOptionHelperId);
        }
        if ($location.search().searchText) {
            $scope.searchText = $location.search().searchText;
        }
    }
    CommonSettingsController.$inject = ['$scope', 'CommonSettingsService', 'ChromeStorageService', '$location', '$mdDialog', '$sce'];
    return CommonSettingsController;
}());
app.controller('CommonSettingsController', CommonSettingsController);
