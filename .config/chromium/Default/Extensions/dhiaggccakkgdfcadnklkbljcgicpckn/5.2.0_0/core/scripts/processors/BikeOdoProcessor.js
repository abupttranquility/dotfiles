var BikeOdoProcessor = (function () {
    function BikeOdoProcessor(vacuumProcessor, athleteId) {
        this.vacuumProcessor = vacuumProcessor;
        this.cacheAgingTime = 120 * 60;
        this.athleteId = athleteId;
        this.cacheKey = 'stravistix_bikeOdo_' + athleteId + '_cache';
    }
    BikeOdoProcessor.prototype.getBikeOdoOfAthlete = function (callback) {
        var _this = this;
        var cache = localStorage.getItem(this.cacheKey);
        var storedOdos = JSON.parse(localStorage.getItem(this.cacheKey));
        var cacheDeprecated = false;
        var now = Math.floor(Date.now() / 1000);
        if (storedOdos && (now > storedOdos.cachedOnTimeStamp + this.cacheAgingTime)) {
            console.log('bike ode cache is deprecated');
            cacheDeprecated = true;
        }
        if (!_.isNull(cache) && !_.isEqual(cache, "null") && !cacheDeprecated) {
            if (env.debugMode)
                console.log("Using bike odo cache: " + cache);
            callback(storedOdos);
            return;
        }
        this.vacuumProcessor.getBikeOdoOfAthlete(this.athleteId, function (bikeOdoArray) {
            bikeOdoArray.cachedOnTimeStamp = Math.floor(Date.now() / 1000);
            if (env.debugMode)
                console.log("Creating bike odo cache inside cookie " + _this.cacheKey);
            try {
                localStorage.setItem(_this.cacheKey, JSON.stringify(bikeOdoArray));
            }
            catch (err) {
                console.warn(err);
                localStorage.clear();
            }
            callback(bikeOdoArray);
        });
    };
    BikeOdoProcessor.prototype.getCacheKey = function () {
        return this.cacheKey;
    };
    return BikeOdoProcessor;
}());
