var MainController = (function () {
    function MainController($rootScope, chromeStorageService, $scope, $location, $mdSidenav, $colors, $mdDialog, $window, $interval, $mdMedia) {
        $scope.colors = $colors;
        $scope.updateLastSyncDateDisplay = function () {
            chromeStorageService.getLastSyncDate().then(function (lastSyncDate) {
                $rootScope.lastSyncDate = lastSyncDate;
                if ($rootScope.lastSyncDate === -1) {
                    $scope.lastSyncDateDisplay = "Sync your history";
                }
                else {
                    $scope.lastSyncDateDisplay = "Synced " + moment($scope.lastSyncDate).fromNow();
                }
            });
        };
        $scope.updateLastSyncDateDisplay();
        $interval($scope.updateLastSyncDateDisplay, 1000 * 60);
        $scope.$watch(function () {
            return $mdMedia('gt-md');
        }, function (greaterThanMid) {
            $scope.sideNavLockedOpen = greaterThanMid;
            setTimeout(function () {
                $rootScope.$broadcast('window-resize-gt-md');
            }, 750);
        });
        $scope.toggleSidenav = function (menu) {
            $mdSidenav(menu).toggle();
        };
        $scope.forward = function (target) {
            if (target.message) {
                var dialog = $mdDialog.confirm()
                    .htmlContent(target.message)
                    .cancel('ok').ok('Help this free project.');
                $mdDialog.show(dialog).then(function () {
                    $scope.showDonation();
                }, function () {
                });
            }
            else {
                $scope.pageTitle = (target.subname) ? target.subname : target.name;
                $location.path(target.link);
            }
        };
        $scope.uiStructure = {
            mainTitle: 'Stravistix',
            sidenav: {
                sections: [{
                        id: 'FITNESS_TREND',
                        name: 'Multisports Fitness Trend',
                        subname: 'Multisports fitness trend based on activities having HR sensor',
                        sup: 'BETA',
                        icon: 'timeline',
                        link: routeMap.fitnessTrendRoute,
                    }, {
                        id: 'YEAR_PROGRESSION',
                        name: 'Year progression',
                        icon: 'show_chart',
                        link: 'link',
                        hide: true
                    }, {
                        id: 'COMMON_SETTINGS',
                        name: 'Common Settings',
                        icon: 'settings',
                        link: routeMap.commonSettingsRoute
                    }, {
                        id: 'ATHLETE_SETTINGS',
                        name: 'Athlete Settings',
                        icon: 'accessibility',
                        link: routeMap.athleteSettingsRoute
                    }, {
                        id: 'ZONES_SETTINGS',
                        name: 'Zones Settings',
                        icon: 'format_line_spacing',
                        expand: false,
                        link: 'link',
                        actions: [{
                                name: 'Heart rate reserve',
                                subname: 'Customize Heartrate Reserve zones',
                                icon: 'favorite',
                                link: routeMap.hrrZonesSettingsRoute
                            }, {
                                name: 'Cycling Speed',
                                subname: 'Customize Cycling Speed zones',
                                icon: 'directions_bike',
                                link: routeMap.zonesSettingsRoute + '/speed'
                            }, {
                                name: 'Running Pace',
                                subname: 'Customize Running Pace zones',
                                icon: 'directions_walk',
                                link: routeMap.zonesSettingsRoute + '/pace'
                            }, {
                                name: 'Cycling Power',
                                subname: 'Customize Cycling Power zones',
                                icon: 'flash_on',
                                link: routeMap.zonesSettingsRoute + '/power'
                            }, {
                                name: 'Cycling Cadence',
                                subname: 'Customize Cycling Cadence zones',
                                icon: 'autorenew',
                                link: routeMap.zonesSettingsRoute + '/cyclingCadence'
                            }, {
                                name: 'Running Cadence',
                                subname: 'Customize Running Cadence zones',
                                icon: 'transfer_within_a_station',
                                link: routeMap.zonesSettingsRoute + '/runningCadence'
                            }, {
                                name: 'Grade',
                                subname: 'Customize Grade zones',
                                icon: 'trending_up',
                                link: routeMap.zonesSettingsRoute + '/grade'
                            }, {
                                name: 'Elevation',
                                subname: 'Customize Elevation zones',
                                icon: 'terrain',
                                link: routeMap.zonesSettingsRoute + '/elevation'
                            }, {
                                name: 'Cycling Ascent Speed',
                                subname: 'Customize Cycling Ascent Speed zones',
                                icon: 'call_made',
                                link: routeMap.zonesSettingsRoute + '/ascent'
                            }]
                    }, {
                        id: 'DASHBOARD',
                        name: 'Dashboard',
                        icon: 'dashboard',
                        link: 'link',
                        sup: 'SOON',
                        message: '<strong>Work in progress feature</strong></br></br>- Interrogate any stats of your history on a period. STX extended stats included.</br>- Interrogate by sports, by bike, ...</br>- Result goes in a tile in dashboard.</br>- Assign target in option: min, max, average or total to reach.</br>- Fully customisable.',
                    }, {
                        id: 'ACTIVITIES_GRID',
                        name: 'Grid',
                        icon: 'grid_on',
                        link: 'link',
                        sup: 'SOON',
                        message: '<strong>Work in progress feature</strong></br></br>- All your activities in a table: <i>A column = A stat</i></br>- STX extended stats included.</br>- Fast searching along stats: Best TRIMP activity? Best W/KG ride ever? ...',
                    }]
            }
        };
        $scope.updateMenuAndToolbarAlongPageLoaded = function () {
            var path = $location.path();
            if (_.isEmpty(path)) {
                path = routeMap.commonSettingsRoute;
            }
            var sectionFound = _.findWhere($scope.uiStructure.sidenav.sections, {
                link: $location.path()
            });
            if (sectionFound) {
                $scope.pageTitle = (sectionFound.subname) ? sectionFound.subname : sectionFound.name;
            }
            else {
                var sectionsWithActions = _.filter($scope.uiStructure.sidenav.sections, function (section) {
                    return !_.isEmpty(section.actions);
                });
                var actionFound = void 0;
                for (var i = 0; i < sectionsWithActions.length; i++) {
                    var section = sectionsWithActions[i];
                    actionFound = _.findWhere(section.actions, {
                        link: path
                    });
                    if (actionFound) {
                        section.expand = true;
                        break;
                    }
                }
                if (!actionFound) {
                    $scope.pageTitle = '';
                }
                else {
                    $scope.pageTitle = (actionFound.subname) ? actionFound.subname : actionFound.name;
                }
            }
        };
        setTimeout(function () {
            $scope.updateMenuAndToolbarAlongPageLoaded();
        });
        $scope.showDonation = function () {
            $mdDialog.show({
                controller: function ($scope, $window) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.goToPaypal = function () {
                        $window.open('https://www.paypal.me/thomaschampagne/' + properties.donateAmount, '_blank');
                    };
                },
                templateUrl: 'views/modals/donate.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        if (!_.isEmpty($location.search().showDonation)) {
            $scope.showDonation();
        }
        $scope.showSharing = function () {
            $mdDialog.show({
                controller: function ($scope, $window) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.shareTwitter = function () {
                        $window.open('https://twitter.com/intent/tweet?text=As%20%23strava%20user,%20you%20should%20try%20%23stravistix%20web%20extension%20by%20%40champagnethomas.%20Get%20it%20here%20%20http://thomaschampagne.github.io/stravistix/.%20%23cycling%20%23running%20%23geek', '_blank');
                    };
                    $scope.shareFacebook = function () {
                        $window.open('https://www.facebook.com/stravistixforstrava', '_blank');
                    };
                    $scope.openPluginPage = function () {
                        $scope.$parent().openPluginPage();
                    };
                },
                templateUrl: 'views/modals/share.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        if (!_.isEmpty($location.search().showSharing)) {
            $scope.showSharing();
        }
        $scope.openPluginPage = function () {
            $window.open('http://thomaschampagne.github.io/stravistix/', '_blank');
        };
        $scope.openStravaClub = function () {
            $window.open('https://www.strava.com/clubs/stravistix', '_blank');
        };
        $scope.openFAQ = function () {
            $window.open('https://github.com/thomaschampagne/stravistix/wiki/Frequently-Asked-Questions', '_blank');
        };
        $scope.openBugReport = function () {
            var newIssueURL = 'https://github.com/thomaschampagne/stravistix/issues/new?body=**Bug%20description:**%20%0A%0A**Actual%20Behavior:**%20%0A%0A**Expected%20Behavior:**%20%0A%0A**Steps%20to%20Reproduce:**%20%0A-%20...%0A%20-%20...%0A%20-%20...%0A%0A**Chrome%20version**%20%0A%0A**Plugin%20version:**%20%0A%0A**Activities%20links?:**%20%0A%0A**Console%20errors?%20(press%20F12%20to%20see%20developer%20console,%20and%20copy%20paste%20here):**%20%0A%0A```%20%0Aput%20console%20errors%20here%20if%20exist%20%0A```%20%0A%0A**Link%20screenshots%20or%20youtube%20video%20link%20if%20necessary:**';
            $window.open(newIssueURL, '_blank');
        };
        $scope.openProjectSources = function () {
            $window.open('https://github.com/thomaschampagne/stravistix/', '_blank');
        };
        $scope.showReleaseNotes = function () {
            $mdDialog.show({
                controller: function ($scope, ReleaseNotesService, $window) {
                    $scope.releaseNotes = ReleaseNotesService.data;
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.showVersionDiff = function (from, to) {
                        if (from && to) {
                            $window.open('https://github.com/thomaschampagne/stravistix/compare/' + from + '...' + to, '_blank');
                        }
                    };
                    $scope.openTwitter = function () {
                        $scope.$parent.openTwitter();
                    };
                },
                templateUrl: 'views/modals/releaseNotes.html',
                scope: $scope.$new(),
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        if (!_.isEmpty($location.search().showReleaseNotes)) {
            $scope.showReleaseNotes();
        }
        $scope.showAbout = function () {
            $mdDialog.show({
                controller: function ($scope) {
                    chromeStorageService.getLocalStorageUsage().then(function (storageUsage) {
                        $scope.storageUsage = 'History size: ' + (storageUsage.bytesInUse / (1024 * 1024)).toFixed(1) + 'MB.';
                    });
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'views/modals/about.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
        $scope.openTwitter = function () {
            $window.open('https://twitter.com/champagnethomas', '_blank');
        };
        $scope.syncNow = function (forceSync) {
            chrome.tabs.getCurrent(function (tab) {
                $window.open('https://www.strava.com/dashboard?stravistixSync=true&forceSync=' + forceSync + '&sourceTabId=' + tab.id, '_blank', 'width=700, height=675, location=0');
            });
        };
        $scope.clearHistory = function () {
            var confirm = $mdDialog.confirm()
                .title('Are you sure to delete your history?')
                .textContent('Performing this action will clear your history of activities synced. Features which depends of your history will not be displayed anymore until you perform a new synchronization.')
                .ariaLabel('Are you sure to delete your history?')
                .ok('Delete my history')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                chromeStorageService.removeFromLocalStorage('computedActivities').then(function () {
                    return chromeStorageService.removeFromLocalStorage('lastSyncDateTime');
                }).then(function () {
                    return chromeStorageService.removeFromLocalStorage('syncWithAthleteProfile');
                }).then(function () {
                    $window.location.reload();
                });
            }, function () {
            });
        };
        $scope.saveHistory = function () {
            chromeStorageService.getAllFromLocalStorage().then(function (data) {
                data = _.pick(data, 'lastSyncDateTime', 'syncWithAthleteProfile', 'computedActivities');
                if (_.isEmpty(data.computedActivities)) {
                    alert("No history to backup. Perform full sync at first");
                    return;
                }
                data.pluginVersion = chrome.runtime.getManifest().version;
                var blob = new Blob([angular.toJson(data)], { type: "application/json; charset=utf-8" });
                var filename = moment().format('Y.M.D-H.mm') + '_v' + data.pluginVersion + '.history.json';
                saveAs(blob, filename);
                var dialog = $mdDialog.alert()
                    .htmlContent('<i>' + filename + '</i> file should be dropped in your download folder.')
                    .ok('Got it !');
                $mdDialog.show(dialog);
            });
        };
        $scope.restoreHistory = function () {
            $mdDialog.show({
                controller: function ($scope) {
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                },
                templateUrl: 'views/modals/restoreHistory.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };
    }
    MainController.$inject = ['$rootScope', 'ChromeStorageService', '$scope', '$location', '$mdSidenav', '$colors', '$mdDialog', '$window', '$interval', '$mdMedia'];
    return MainController;
}());
app.controller('MainController', MainController);
