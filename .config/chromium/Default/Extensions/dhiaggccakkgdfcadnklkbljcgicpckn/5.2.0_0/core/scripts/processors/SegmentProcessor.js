var SegmentProcessor = (function () {
    function SegmentProcessor(vacuumProcessor, segmentId) {
        this.vacuumProcessor = vacuumProcessor;
        this.segmentId = segmentId;
    }
    SegmentProcessor.prototype.getNearbySegmentsAround = function (callback) {
        var _this = this;
        var cacheResult = JSON.parse(localStorage.getItem(SegmentProcessor.cachePrefix + this.segmentId));
        if (!_.isNull(cacheResult) && !env.debugMode) {
            if (env.debugMode)
                console.log("Using existing nearbySegments cache in non debug mode: " + JSON.stringify(cacheResult));
            callback(cacheResult);
            return;
        }
        this.getSegmentAroundSearchPoint(function (searchPoint) {
            var boundingBox = _this.getBoundingBox(searchPoint, 2000);
            _this.getSegmentsInBoundingBox(boundingBox, function (segmentsInBounds) {
                if (env.debugMode)
                    console.log("Creating nearbySegments cache: " + JSON.stringify(segmentsInBounds));
                try {
                    localStorage.setItem(SegmentProcessor.cachePrefix + _this.segmentId, JSON.stringify(segmentsInBounds));
                }
                catch (err) {
                    console.warn(err);
                    localStorage.clear();
                }
                callback(segmentsInBounds);
            });
        });
    };
    SegmentProcessor.prototype.getBoundingBox = function (point, distance) {
        return [
            point.destinationPoint(distance, 180).lat,
            point.destinationPoint(distance, -90).lon,
            point.destinationPoint(distance, 0).lat,
            point.destinationPoint(distance, 90).lon,
        ];
    };
    SegmentProcessor.prototype.getSegmentsInBoundingBox = function (boundingBox, callback) {
        var _this = this;
        this.vacuumProcessor.getSegmentsFromBounds(boundingBox[0] + ',' + boundingBox[1], boundingBox[2] + ',' + boundingBox[3], function (segmentsData) {
            _.each(segmentsData.cycling.segments, function (segment) {
                segment.type = 'cycling';
            });
            _.each(segmentsData.running.segments, function (segment) {
                segment.type = 'running';
            });
            segmentsData = _.union(segmentsData.cycling.segments, segmentsData.running.segments);
            segmentsData = _.filter(segmentsData, function (segment) {
                return (segment.id !== _this.segmentId);
            });
            callback(segmentsData);
        });
    };
    SegmentProcessor.prototype.getSegmentAroundSearchPoint = function (callback) {
        this.vacuumProcessor.getSegmentStream(this.segmentId, function (stream) {
            var startPoint = stream.latlng[0];
            var midPoint = stream.latlng[(stream.latlng.length / 2).toFixed(0)];
            var endPoint = stream.latlng[stream.latlng.length - 1];
            var approximateSearchPoint = [null, null];
            approximateSearchPoint[0] = (startPoint[0] + endPoint[0]) / 2;
            approximateSearchPoint[1] = (startPoint[1] + endPoint[1]) / 2;
            approximateSearchPoint[0] = (approximateSearchPoint[0] + midPoint[0]) / 2;
            approximateSearchPoint[1] = (approximateSearchPoint[1] + midPoint[1]) / 2;
            callback(new LatLon(approximateSearchPoint[0], approximateSearchPoint[1]));
        });
    };
    SegmentProcessor.cachePrefix = 'stravistix_nearbySegments_';
    return SegmentProcessor;
}());
