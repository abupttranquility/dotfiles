var Background = (function () {
    function Background() {
    }
    Background.prototype.init = function () {
        this.listenForExternalMessages();
        this.listenInstallUpdate();
    };
    Background.prototype.reloadBrowserTab = function (tabId) {
        console.log('Now reloading tab id ' + tabId);
        chrome.tabs.reload(tabId);
    };
    Background.prototype.listenForExternalMessages = function () {
        var _this = this;
        chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
            var storageManager = new StorageManager(request.params.storage);
            switch (request.method) {
                case Helper.reloadBrowserTabMethod:
                    _this.reloadBrowserTab(request.params.sourceTabId);
                    break;
                case Helper.getFromStorageMethod:
                    storageManager.getFromStorage(request.params.key, function (returnedValue) {
                        sendResponse({
                            data: returnedValue
                        });
                    });
                    break;
                case Helper.setToStorageMethod:
                    storageManager.setToStorage(request.params.key, request.params.value, function (returnAllData) {
                        sendResponse({
                            data: returnAllData
                        });
                    });
                    break;
                case Helper.removeFromStorageMethod:
                    storageManager.storageType = request.params.storage;
                    storageManager.removeFromStorage(request.params.key, function (returnAllData) {
                        sendResponse({
                            data: returnAllData
                        });
                    });
                    break;
                case Helper.getStorageUsageMethod:
                    storageManager.storageType = request.params.storage;
                    storageManager.getStorageUsage(function (response) {
                        sendResponse({
                            data: response
                        });
                    });
                    break;
                default:
                    return false;
            }
            return true;
        });
    };
    Background.prototype.listenInstallUpdate = function () {
        var _this = this;
        var storageManager = new StorageManager(StorageManager.storageSyncType);
        chrome.runtime.onInstalled.addListener(function (details) {
            var thisVersion = chrome.runtime.getManifest().version;
            if (details.reason === "install") {
                chrome.tabs.create({
                    url: 'http://thomaschampagne.github.io/stravistix/'
                }, function (tab) {
                    console.log("First install. Display website new tab:", tab);
                    chrome.tabs.create({
                        url: chrome.extension.getURL('/options/app/index.html#/')
                    }, function (tab) {
                        console.log("First install. Display settings:", tab);
                    });
                });
            }
            else if (details.reason === "update") {
                console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
                if (Helper.versionCompare('3.9.0', details.previousVersion) === 1) {
                    console.log('Reset zones...');
                    storageManager.setToStorage('userHrrZones', userSettings.userHrrZones, function (data) {
                        console.log('userHrrZones revert to ', userSettings.userHrrZones);
                        console.log(data);
                        storageManager.setToStorage('zones', userSettings.zones, function (data) {
                            console.log('zones revert to ', userSettings.zones);
                            console.log(data);
                        });
                    });
                }
                if (Helper.versionCompare('5.0.1', details.previousVersion) === 1) {
                    storageManager.setToStorage('displayExtendedGoals', false, function (data) {
                        console.log('displayExtendedGoals set false ', data);
                    });
                }
                if (Helper.versionCompare('5.1.1', details.previousVersion) === 1) {
                    _this.clearSyncCache();
                }
            }
        });
    };
    Background.prototype.clearSyncCache = function () {
        var storageManagerOnLocal = new StorageManager(StorageManager.storageLocalType);
        storageManagerOnLocal.removeFromStorage('computedActivities', function () {
            storageManagerOnLocal.removeFromStorage('lastSyncDateTime', function () {
                storageManagerOnLocal.removeFromStorage('syncWithAthleteProfile', function () {
                    console.log('Local History cleared');
                });
            });
        });
    };
    return Background;
}());
var background = new Background();
background.init();
