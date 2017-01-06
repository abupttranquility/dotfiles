var ChromeStorageService = (function () {
    function ChromeStorageService(q) {
        this.$q = q;
    }
    ChromeStorageService.prototype.getAllFromLocalStorage = function () {
        var deferred = this.$q.defer();
        chrome.storage.local.get(null, function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.getFromLocalStorage = function (key) {
        var deferred = this.$q.defer();
        var object = {};
        object[key] = null;
        chrome.storage.local.get(object, function (data) {
            deferred.resolve(data[key]);
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.setToLocalStorage = function (key, value) {
        var deferred = this.$q.defer();
        var object = {};
        object[key] = value;
        chrome.storage.local.set(object, function () {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                deferred.reject(chrome.runtime.lastError);
            }
            else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.removeFromLocalStorage = function (key) {
        var deferred = this.$q.defer();
        chrome.storage.local.remove(key, function () {
            deferred.resolve();
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.getLastSyncDate = function () {
        var deferred = this.$q.defer();
        this.getFromLocalStorage('lastSyncDateTime').then(function (lastSyncDateTime) {
            if (_.isUndefined(lastSyncDateTime) || _.isNull(lastSyncDateTime) || !_.isNumber(lastSyncDateTime)) {
                deferred.resolve(-1);
            }
            else {
                deferred.resolve(lastSyncDateTime);
            }
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.getLocalSyncedAthleteProfile = function () {
        return this.getFromLocalStorage('syncWithAthleteProfile');
    };
    ChromeStorageService.prototype.getProfileConfigured = function () {
        return this.getFromLocalStorage('profileConfigured');
    };
    ChromeStorageService.prototype.setProfileConfigured = function (status) {
        var deferred = this.$q.defer();
        chrome.storage.local.set({
            profileConfigured: status
        }, function () {
            deferred.resolve();
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.fetchUserSettings = function (callback) {
        var deferred = this.$q.defer();
        chrome.storage.sync.get(userSettings, function (userSettingsSynced) {
            if (callback)
                callback(userSettingsSynced);
            deferred.resolve(userSettingsSynced);
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.updateUserSetting = function (key, value, callback) {
        var deferred = this.$q.defer();
        var settingToBeUpdated = {};
        settingToBeUpdated[key] = value;
        chrome.storage.sync.set(settingToBeUpdated, function () {
            if (callback)
                callback();
            deferred.resolve();
        });
        return deferred.promise;
    };
    ChromeStorageService.prototype.fetchComputedActivities = function () {
        return this.getFromLocalStorage('computedActivities');
    };
    ChromeStorageService.prototype.getLocalStorageUsage = function () {
        var deferred = this.$q.defer();
        chrome.storage.local.getBytesInUse(function (bytesInUse) {
            deferred.resolve({
                bytesInUse: bytesInUse,
                quotaBytes: chrome.storage.local.QUOTA_BYTES,
                percentUsage: bytesInUse / chrome.storage.local.QUOTA_BYTES * 100
            });
        });
        return deferred.promise;
    };
    return ChromeStorageService;
}());
app.factory('ChromeStorageService', ['$q', function ($q) {
        return new ChromeStorageService($q);
    }]);
