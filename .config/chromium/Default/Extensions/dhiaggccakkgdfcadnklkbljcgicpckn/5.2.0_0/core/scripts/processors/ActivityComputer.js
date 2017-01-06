var ActivityComputer = (function () {
    function ActivityComputer(activityType, isTrainer, userSettings, athleteWeight, hasPowerMeter, activityStatsMap, activityStream, bounds, returnZones) {
        this.activityType = activityType;
        this.isTrainer = isTrainer;
        this.userSettings = userSettings;
        this.athleteWeight = athleteWeight;
        this.hasPowerMeter = hasPowerMeter;
        this.activityStatsMap = activityStatsMap;
        this.activityStream = activityStream;
        this.bounds = bounds;
        this.returnZones = returnZones;
    }
    ActivityComputer.prototype.compute = function () {
        if (!this.activityStream) {
            return null;
        }
        this.activityStream.altitude_smooth = this.smoothAltitudeStream(this.activityStream, this.activityStatsMap);
        this.sliceStreamFromBounds(this.activityStream, this.bounds);
        return this.computeAnalysisData(this.userSettings.userGender, this.userSettings.userRestHr, this.userSettings.userMaxHr, this.userSettings.userFTP, this.athleteWeight, this.hasPowerMeter, this.activityStatsMap, this.activityStream);
    };
    ActivityComputer.prototype.sliceStreamFromBounds = function (activityStream, bounds) {
        if (bounds && bounds[0] && bounds[1]) {
            if (!_.isEmpty(activityStream.velocity_smooth)) {
                activityStream.velocity_smooth = activityStream.velocity_smooth.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.time)) {
                activityStream.time = activityStream.time.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.heartrate)) {
                activityStream.heartrate = activityStream.heartrate.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.watts)) {
                activityStream.watts = activityStream.watts.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.watts_calc)) {
                activityStream.watts_calc = activityStream.watts_calc.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.cadence)) {
                activityStream.cadence = activityStream.cadence.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.grade_smooth)) {
                activityStream.grade_smooth = activityStream.grade_smooth.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.altitude)) {
                activityStream.altitude = activityStream.altitude.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.distance)) {
                activityStream.distance = activityStream.distance.slice(bounds[0], bounds[1]);
            }
            if (!_.isEmpty(activityStream.altitude_smooth)) {
                activityStream.altitude_smooth = activityStream.altitude_smooth.slice(bounds[0], bounds[1]);
            }
        }
    };
    ActivityComputer.prototype.smoothAltitudeStream = function (activityStream, activityStatsMap) {
        return this.smoothAltitude(activityStream, activityStatsMap.elevation);
    };
    ActivityComputer.prototype.computeAnalysisData = function (userGender, userRestHr, userMaxHr, userFTP, athleteWeight, hasPowerMeter, activityStatsMap, activityStream) {
        this.movementData = null;
        if (activityStream.velocity_smooth) {
            this.movementData = this.moveData(activityStream.velocity_smooth, activityStream.time);
        }
        var speedData = (_.isEmpty(this.movementData)) ? null : this.movementData.speed;
        var paceData = (_.isEmpty(this.movementData)) ? null : this.movementData.pace;
        var moveRatio = (_.isEmpty(this.movementData)) ? null : this.moveRatio(this.movementData.movingTime, this.movementData.elapsedTime);
        var toughnessScore = this.toughnessScore(activityStatsMap, moveRatio);
        var powerData = this.powerData(athleteWeight, hasPowerMeter, userFTP, activityStream.watts, activityStream.velocity_smooth, activityStream.time);
        var heartRateData = this.heartRateData(userGender, userRestHr, userMaxHr, activityStream.heartrate, activityStream.time, activityStream.velocity_smooth, activityStatsMap);
        var cadenceData = this.cadenceData(activityStream.cadence, activityStream.velocity_smooth, activityStream.time);
        var gradeData = this.gradeData(activityStream.grade_smooth, activityStream.velocity_smooth, activityStream.time, activityStream.distance);
        var elevationData = this.elevationData(activityStream);
        var analysisData = {
            moveRatio: moveRatio,
            toughnessScore: toughnessScore,
            speedData: speedData,
            paceData: paceData,
            powerData: powerData,
            heartRateData: heartRateData,
            cadenceData: cadenceData,
            gradeData: gradeData,
            elevationData: elevationData
        };
        return analysisData;
    };
    ActivityComputer.prototype.moveRatio = function (movingTime, elapsedTime) {
        if (_.isNull(movingTime) || _.isNull(elapsedTime)) {
            return null;
        }
        var ratio = movingTime / elapsedTime;
        if (_.isNaN(ratio)) {
            return null;
        }
        return ratio;
    };
    ActivityComputer.prototype.toughnessScore = function (activityStatsMap, moveRatio) {
        if (_.isNull(activityStatsMap.elevation) || _.isNull(activityStatsMap.avgPower) || _.isNull(activityStatsMap.averageSpeed) || _.isNull(activityStatsMap.distance)) {
            return null;
        }
        return Math.sqrt(Math.sqrt(Math.pow(activityStatsMap.elevation, 2) *
            activityStatsMap.avgPower *
            Math.pow(activityStatsMap.averageSpeed, 2) *
            Math.pow(activityStatsMap.distance, 2) *
            moveRatio)) / 20;
    };
    ActivityComputer.prototype.getZoneFromDistributionStep = function (value, distributionStep, minValue) {
        return ((value - minValue) / distributionStep);
    };
    ActivityComputer.prototype.getZoneId = function (zones, value) {
        for (var zoneId = 0; zoneId < zones.length; zoneId++) {
            if (value <= zones[zoneId].to) {
                return zoneId;
            }
        }
    };
    ActivityComputer.prototype.prepareZonesForDistributionComputation = function (sourceZones) {
        var preparedZones = [];
        _.each(sourceZones, function (zone) {
            zone.s = 0;
            zone.percentDistrib = null;
            preparedZones.push(zone);
        });
        return preparedZones;
    };
    ActivityComputer.prototype.finalizeDistributionComputationHrrZones = function (zones) {
        var total = 0;
        var zone;
        for (var i = 0; i < zones.length; i++) {
            zone = zones[i];
            if (zone.s) {
                total += zone.s;
            }
            zone.percentDistrib = 0;
        }
        if (total > 0) {
            for (var i = 0; i < zones.length; i++) {
                zone = zones[i];
                if (zone.s) {
                    zone.percentDistrib = zone.s / total * 100;
                }
            }
        }
        return zones;
    };
    ActivityComputer.prototype.finalizeDistributionComputationZones = function (zones) {
        var total = 0;
        var zone;
        for (var i = 0; i < zones.length; i++) {
            zone = zones[i];
            if (zone.s) {
                total += zone.s;
            }
            zone.percentDistrib = 0;
        }
        if (total > 0) {
            for (var i = 0; i < zones.length; i++) {
                zone = zones[i];
                if (zone.s) {
                    zone.percentDistrib = zone.s / total * 100;
                }
            }
        }
        return zones;
    };
    ActivityComputer.prototype.valueForSum = function (currentValue, previousValue, delta) {
        return currentValue * delta - ((currentValue - previousValue) * delta) / 2;
    };
    ActivityComputer.prototype.moveData = function (velocityArray, timeArray) {
        if (_.isEmpty(velocityArray) || _.isEmpty(timeArray)) {
            return null;
        }
        var genuineAvgSpeedSum = 0, genuineAvgSpeedSumCount = 0;
        var speedsNonZero = [];
        var speedsNonZeroDuration = [];
        var speedVarianceSum = 0;
        var currentSpeed;
        var speedZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.speed);
        var paceZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.pace);
        var movingSeconds = 0;
        var elapsedSeconds = 0;
        for (var i = 0; i < velocityArray.length; i++) {
            if (i > 0) {
                elapsedSeconds += (timeArray[i] - timeArray[i - 1]);
                currentSpeed = velocityArray[i] * 3.6;
                if (currentSpeed > 0) {
                    movingSeconds = (timeArray[i] - timeArray[i - 1]);
                    speedsNonZero.push(currentSpeed);
                    speedsNonZeroDuration.push(movingSeconds);
                    speedVarianceSum += Math.pow(currentSpeed, 2);
                    genuineAvgSpeedSum += this.valueForSum(velocityArray[i] * 3.6, velocityArray[i - 1] * 3.6, movingSeconds);
                    genuineAvgSpeedSumCount += movingSeconds;
                    var speedZoneId = this.getZoneId(this.userSettings.zones.speed, currentSpeed);
                    if (!_.isUndefined(speedZoneId) && !_.isUndefined(speedZones[speedZoneId])) {
                        speedZones[speedZoneId].s += movingSeconds;
                    }
                    var pace = this.convertSpeedToPace(currentSpeed);
                    var paceZoneId = this.getZoneId(this.userSettings.zones.pace, (pace === -1) ? 0 : pace);
                    if (!_.isUndefined(paceZoneId) && !_.isUndefined(paceZones[paceZoneId])) {
                        paceZones[paceZoneId].s += movingSeconds;
                    }
                }
            }
        }
        speedZones = this.finalizeDistributionComputationZones(speedZones);
        paceZones = this.finalizeDistributionComputationZones(paceZones);
        var genuineAvgSpeed = genuineAvgSpeedSum / genuineAvgSpeedSumCount;
        var varianceSpeed = (speedVarianceSum / speedsNonZero.length) - Math.pow(genuineAvgSpeed, 2);
        var standardDeviationSpeed = (varianceSpeed > 0) ? Math.sqrt(varianceSpeed) : 0;
        var percentiles = Helper.weightedPercentiles(speedsNonZero, speedsNonZeroDuration, [0.25, 0.5, 0.75]);
        var speedData = {
            genuineAvgSpeed: genuineAvgSpeed,
            totalAvgSpeed: genuineAvgSpeed * this.moveRatio(genuineAvgSpeedSumCount, elapsedSeconds),
            avgPace: parseInt(((1 / genuineAvgSpeed) * 60 * 60).toFixed(0)),
            lowerQuartileSpeed: percentiles[0],
            medianSpeed: percentiles[1],
            upperQuartileSpeed: percentiles[2],
            varianceSpeed: varianceSpeed,
            standardDeviationSpeed: standardDeviationSpeed,
            speedZones: (this.returnZones) ? speedZones : null
        };
        var paceData = {
            avgPace: parseInt(((1 / genuineAvgSpeed) * 60 * 60).toFixed(0)),
            lowerQuartilePace: this.convertSpeedToPace(percentiles[0]),
            medianPace: this.convertSpeedToPace(percentiles[1]),
            upperQuartilePace: this.convertSpeedToPace(percentiles[2]),
            variancePace: this.convertSpeedToPace(varianceSpeed),
            paceZones: (this.returnZones) ? paceZones : null
        };
        var moveData = {
            movingTime: genuineAvgSpeedSumCount,
            elapsedTime: elapsedSeconds,
            speed: speedData,
            pace: paceData
        };
        return moveData;
    };
    ActivityComputer.prototype.convertSpeedToPace = function (speed) {
        if (_.isNaN(speed)) {
            return -1;
        }
        return (speed === 0) ? -1 : 1 / speed * 60 * 60;
    };
    ActivityComputer.prototype.powerData = function (athleteWeight, hasPowerMeter, userFTP, powerArray, velocityArray, timeArray) {
        if (_.isEmpty(powerArray) || _.isEmpty(timeArray)) {
            return null;
        }
        var accumulatedWattsOnMove = 0;
        var wattSampleOnMoveCount = 0;
        var wattsSamplesOnMove = [];
        var wattsSamplesOnMoveDuration = [];
        var powerZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.power);
        var durationInSeconds;
        var timeWindowValue = 0;
        var sumPowerTimeWindow = [];
        var sum4thPower = [];
        for (var i = 0; i < powerArray.length; i++) {
            if ((this.isTrainer || !velocityArray || velocityArray[i] * 3.6 > ActivityComputer.MOVING_THRESHOLD_KPH) && i > 0) {
                durationInSeconds = (timeArray[i] - timeArray[i - 1]);
                timeWindowValue += durationInSeconds;
                sumPowerTimeWindow.push(powerArray[i]);
                if (timeWindowValue >= ActivityComputer.AVG_POWER_TIME_WINDOW_SIZE) {
                    sum4thPower.push(Math.pow(_.reduce(sumPowerTimeWindow, function (a, b) {
                        return a + b;
                    }, 0) / sumPowerTimeWindow.length, 4));
                    timeWindowValue = 0;
                    sumPowerTimeWindow = [];
                }
                wattsSamplesOnMove.push(powerArray[i]);
                wattsSamplesOnMoveDuration.push(durationInSeconds);
                accumulatedWattsOnMove += this.valueForSum(powerArray[i], powerArray[i - 1], durationInSeconds);
                wattSampleOnMoveCount += durationInSeconds;
                var powerZoneId = this.getZoneId(this.userSettings.zones.power, powerArray[i]);
                if (!_.isUndefined(powerZoneId) && !_.isUndefined(powerZones[powerZoneId])) {
                    powerZones[powerZoneId].s += durationInSeconds;
                }
            }
        }
        var avgWatts = accumulatedWattsOnMove / wattSampleOnMoveCount;
        var weightedPower = Math.sqrt(Math.sqrt(_.reduce(sum4thPower, function (a, b) {
            return a + b;
        }, 0) / sum4thPower.length));
        var variabilityIndex = weightedPower / avgWatts;
        var punchFactor = (_.isNumber(userFTP) && userFTP > 0) ? (weightedPower / userFTP) : null;
        var weightedWattsPerKg = weightedPower / athleteWeight;
        var avgWattsPerKg = avgWatts / athleteWeight;
        var percentiles = Helper.weightedPercentiles(wattsSamplesOnMove, wattsSamplesOnMoveDuration, [0.25, 0.5, 0.75]);
        powerZones = this.finalizeDistributionComputationZones(powerZones);
        var powerData = {
            hasPowerMeter: hasPowerMeter,
            avgWatts: avgWatts,
            avgWattsPerKg: avgWattsPerKg,
            weightedPower: weightedPower,
            variabilityIndex: variabilityIndex,
            punchFactor: punchFactor,
            weightedWattsPerKg: weightedWattsPerKg,
            lowerQuartileWatts: percentiles[0],
            medianWatts: percentiles[1],
            upperQuartileWatts: percentiles[2],
            powerZones: (this.returnZones) ? powerZones : null
        };
        return powerData;
    };
    ActivityComputer.prototype.heartRateData = function (userGender, userRestHr, userMaxHr, heartRateArray, timeArray, velocityArray, activityStatsMap) {
        if (_.isEmpty(heartRateArray) || _.isEmpty(timeArray)) {
            return null;
        }
        var trainingImpulse = 0;
        var TRIMPGenderFactor = (userGender == 'men') ? 1.92 : 1.67;
        var hrrSecondsCount = 0;
        var hrrZonesCount = Object.keys(this.userSettings.userHrrZones).length;
        var hr, heartRateReserveAvg, durationInSeconds, durationInMinutes, zoneId;
        var hrSum = 0;
        var heartRateArrayMoving = [];
        var heartRateArrayMovingDuration = [];
        _.each(this.userSettings.userHrrZones, function (zone) {
            zone.fromHr = Helper.heartrateFromHeartRateReserve(zone.fromHrr, userMaxHr, userRestHr);
            zone.toHr = Helper.heartrateFromHeartRateReserve(zone.toHrr, userMaxHr, userRestHr);
            zone.s = 0;
            zone.percentDistrib = null;
        });
        for (var i = 0; i < heartRateArray.length; i++) {
            if ((this.isTrainer || !velocityArray || velocityArray[i] * 3.6 > ActivityComputer.MOVING_THRESHOLD_KPH) && i > 0) {
                durationInSeconds = (timeArray[i] - timeArray[i - 1]);
                hrSum += this.valueForSum(heartRateArray[i], heartRateArray[i - 1], durationInSeconds);
                hrrSecondsCount += durationInSeconds;
                heartRateArrayMoving.push(heartRateArray[i]);
                heartRateArrayMovingDuration.push(durationInSeconds);
                hr = (heartRateArray[i] + heartRateArray[i - 1]) / 2;
                heartRateReserveAvg = Helper.heartRateReserveFromHeartrate(hr, userMaxHr, userRestHr);
                durationInMinutes = durationInSeconds / 60;
                trainingImpulse += durationInMinutes * heartRateReserveAvg * 0.64 * Math.exp(TRIMPGenderFactor * heartRateReserveAvg);
                zoneId = this.getHrrZoneId(hrrZonesCount, heartRateReserveAvg * 100);
                if (!_.isUndefined(zoneId)) {
                    this.userSettings.userHrrZones[zoneId].s += durationInSeconds;
                }
            }
        }
        var heartRateArraySorted = heartRateArray.sort(function (a, b) {
            return a - b;
        });
        this.userSettings.userHrrZones = this.finalizeDistributionComputationHrrZones(this.userSettings.userHrrZones);
        var averageHeartRate = hrSum / hrrSecondsCount;
        var maxHeartRate = heartRateArraySorted[heartRateArraySorted.length - 1];
        var TRIMPPerHour = trainingImpulse / hrrSecondsCount * 60 * 60;
        var percentiles = Helper.weightedPercentiles(heartRateArrayMoving, heartRateArrayMovingDuration, [0.25, 0.5, 0.75]);
        var heartRateData = {
            TRIMP: trainingImpulse,
            TRIMPPerHour: TRIMPPerHour,
            hrrZones: (this.returnZones) ? this.userSettings.userHrrZones : null,
            lowerQuartileHeartRate: percentiles[0],
            medianHeartRate: percentiles[1],
            upperQuartileHeartRate: percentiles[2],
            averageHeartRate: averageHeartRate,
            maxHeartRate: maxHeartRate,
            activityHeartRateReserve: Helper.heartRateReserveFromHeartrate(averageHeartRate, userMaxHr, userRestHr) * 100,
            activityHeartRateReserveMax: Helper.heartRateReserveFromHeartrate(maxHeartRate, userMaxHr, userRestHr) * 100
        };
        return heartRateData;
    };
    ActivityComputer.prototype.getHrrZoneId = function (hrrZonesCount, hrrValue) {
        for (var zoneId = 0; zoneId < hrrZonesCount; zoneId++) {
            if (hrrValue <= this.userSettings.userHrrZones[zoneId].toHrr) {
                return zoneId;
            }
        }
    };
    ActivityComputer.prototype.cadenceData = function (cadenceArray, velocityArray, timeArray) {
        if (_.isEmpty(cadenceArray) || _.isEmpty(timeArray)) {
            return null;
        }
        var crankRevolutions = 0;
        var cadenceSumOnMoving = 0;
        var cadenceSumDurationOnMoving = 0;
        var cadenceVarianceSumOnMoving = 0;
        var cadenceOnMoveSampleCount = 0;
        var movingSampleCount = 0;
        var cadenceZoneTyped;
        if (this.activityType === 'Ride') {
            cadenceZoneTyped = this.userSettings.zones.cyclingCadence;
        }
        else if (this.activityType === 'Run') {
            cadenceZoneTyped = this.userSettings.zones.runningCadence;
        }
        else {
            return null;
        }
        var cadenceZones = this.prepareZonesForDistributionComputation(cadenceZoneTyped);
        var durationInSeconds = 0;
        var cadenceArrayMoving = [];
        var cadenceArrayDuration = [];
        for (var i = 0; i < cadenceArray.length; i++) {
            if (i > 0) {
                durationInSeconds = (timeArray[i] - timeArray[i - 1]);
                crankRevolutions += this.valueForSum(cadenceArray[i], cadenceArray[i - 1], durationInSeconds / 60);
                if ((this.isTrainer || !velocityArray || velocityArray[i] * 3.6 > ActivityComputer.MOVING_THRESHOLD_KPH) && i > 0) {
                    movingSampleCount++;
                    if (cadenceArray[i] > ActivityComputer.CADENCE_THRESHOLD_RPM) {
                        cadenceOnMoveSampleCount++;
                        cadenceSumOnMoving += this.valueForSum(cadenceArray[i], cadenceArray[i - 1], durationInSeconds);
                        cadenceSumDurationOnMoving += durationInSeconds;
                        cadenceVarianceSumOnMoving += Math.pow(cadenceArray[i], 2);
                        cadenceArrayMoving.push(cadenceArray[i]);
                        cadenceArrayDuration.push(durationInSeconds);
                    }
                    var cadenceZoneId = this.getZoneId(cadenceZoneTyped, cadenceArray[i]);
                    if (!_.isUndefined(cadenceZoneId) && !_.isUndefined(cadenceZones[cadenceZoneId])) {
                        cadenceZones[cadenceZoneId].s += durationInSeconds;
                    }
                }
            }
        }
        var cadenceRatioOnMovingTime = cadenceOnMoveSampleCount / movingSampleCount;
        var averageCadenceOnMovingTime = cadenceSumOnMoving / cadenceSumDurationOnMoving;
        var varianceCadence = (cadenceVarianceSumOnMoving / cadenceOnMoveSampleCount) - Math.pow(averageCadenceOnMovingTime, 2);
        var standardDeviationCadence = (varianceCadence > 0) ? Math.sqrt(varianceCadence) : 0;
        cadenceZones = this.finalizeDistributionComputationZones(cadenceZones);
        var percentiles = Helper.weightedPercentiles(cadenceArrayMoving, cadenceArrayDuration, [0.25, 0.5, 0.75]);
        var cadenceData = {
            cadencePercentageMoving: cadenceRatioOnMovingTime * 100,
            cadenceTimeMoving: cadenceSumDurationOnMoving,
            averageCadenceMoving: averageCadenceOnMovingTime,
            standardDeviationCadence: parseFloat(standardDeviationCadence.toFixed(1)),
            crankRevolutions: crankRevolutions,
            lowerQuartileCadence: percentiles[0],
            medianCadence: percentiles[1],
            upperQuartileCadence: percentiles[2],
            cadenceZones: (this.returnZones) ? cadenceZones : null
        };
        return cadenceData;
    };
    ActivityComputer.prototype.gradeData = function (gradeArray, velocityArray, timeArray, distanceArray) {
        if (_.isEmpty(gradeArray) || _.isEmpty(velocityArray) || _.isEmpty(timeArray)) {
            return null;
        }
        if (this.isTrainer) {
            return;
        }
        var gradeSum = 0, gradeCount = 0;
        var gradeZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.grade);
        var upFlatDownInSeconds = {
            up: 0,
            flat: 0,
            down: 0,
            total: 0
        };
        var upFlatDownMoveData = {
            up: 0,
            flat: 0,
            down: 0
        };
        var upFlatDownDistanceData = {
            up: 0,
            flat: 0,
            down: 0
        };
        var durationInSeconds, durationCount = 0;
        var distance = 0;
        var currentSpeed;
        var gradeArrayMoving = [];
        var gradeArrayDistance = [];
        for (var i = 0; i < gradeArray.length; i++) {
            if (i > 0) {
                currentSpeed = velocityArray[i] * 3.6;
                if (currentSpeed > 0) {
                    durationInSeconds = (timeArray[i] - timeArray[i - 1]);
                    distance = distanceArray[i] - distanceArray[i - 1];
                    gradeSum += this.valueForSum(gradeArray[i], gradeArray[i - 1], distance);
                    gradeCount += distance;
                    gradeArrayMoving.push(gradeArray[i]);
                    gradeArrayDistance.push(distance);
                    var gradeZoneId = this.getZoneId(this.userSettings.zones.grade, gradeArray[i]);
                    if (!_.isUndefined(gradeZoneId) && !_.isUndefined(gradeZones[gradeZoneId])) {
                        gradeZones[gradeZoneId].s += durationInSeconds;
                    }
                    durationCount += durationInSeconds;
                    if (gradeArray[i] > ActivityComputer.GRADE_CLIMBING_LIMIT) {
                        upFlatDownInSeconds.up += durationInSeconds;
                        upFlatDownDistanceData.up += distance;
                    }
                    else if (gradeArray[i] < ActivityComputer.GRADE_DOWNHILL_LIMIT) {
                        upFlatDownInSeconds.down += durationInSeconds;
                        upFlatDownDistanceData.down += distance;
                    }
                    else {
                        upFlatDownInSeconds.flat += durationInSeconds;
                        upFlatDownDistanceData.flat += distance;
                    }
                }
            }
        }
        upFlatDownInSeconds.total = durationCount;
        var gradeProfile;
        if ((upFlatDownInSeconds.flat / upFlatDownInSeconds.total * 100) >= ActivityComputer.GRADE_PROFILE_FLAT_PERCENTAGE_DETECTED) {
            gradeProfile = ActivityComputer.GRADE_PROFILE_FLAT;
        }
        else {
            gradeProfile = ActivityComputer.GRADE_PROFILE_HILLY;
        }
        upFlatDownMoveData.up = upFlatDownDistanceData.up / upFlatDownInSeconds.up * 3.6;
        upFlatDownMoveData.down = upFlatDownDistanceData.down / upFlatDownInSeconds.down * 3.6;
        upFlatDownMoveData.flat = upFlatDownDistanceData.flat / upFlatDownInSeconds.flat * 3.6;
        upFlatDownDistanceData.up = upFlatDownDistanceData.up / 1000;
        upFlatDownDistanceData.down = upFlatDownDistanceData.down / 1000;
        upFlatDownDistanceData.flat = upFlatDownDistanceData.flat / 1000;
        var avgGrade = gradeSum / gradeCount;
        gradeZones = this.finalizeDistributionComputationZones(gradeZones);
        var percentiles = Helper.weightedPercentiles(gradeArrayMoving, gradeArrayDistance, [0.25, 0.5, 0.75]);
        var gradeData = {
            avgGrade: avgGrade,
            lowerQuartileGrade: percentiles[0],
            medianGrade: percentiles[1],
            upperQuartileGrade: percentiles[2],
            gradeZones: (this.returnZones) ? gradeZones : null,
            upFlatDownInSeconds: upFlatDownInSeconds,
            upFlatDownMoveData: upFlatDownMoveData,
            upFlatDownDistanceData: upFlatDownDistanceData,
            gradeProfile: gradeProfile
        };
        return gradeData;
    };
    ActivityComputer.prototype.elevationData = function (activityStream) {
        var distanceArray = activityStream.distance;
        var timeArray = activityStream.time;
        var velocityArray = activityStream.velocity_smooth;
        var altitudeArray = activityStream.altitude_smooth;
        if (_.isEmpty(distanceArray) || _.isEmpty(timeArray) || _.isEmpty(velocityArray) || _.isEmpty(altitudeArray)) {
            return null;
        }
        var skipAscentSpeedCompute = !_.isEmpty(this.bounds);
        var accumulatedElevation = 0;
        var accumulatedElevationAscent = 0;
        var accumulatedElevationDescent = 0;
        var accumulatedDistance = 0;
        var ascentSpeedMeterPerHourSamples = [];
        var ascentSpeedMeterPerHourDistance = [];
        var ascentSpeedMeterPerHourSum = 0;
        var elevationSampleCount = 0;
        var elevationSamples = [];
        var elevationSamplesDistance = [];
        var elevationZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.elevation);
        var ascentSpeedZones = this.prepareZonesForDistributionComputation(this.userSettings.zones.ascent);
        var durationInSeconds = 0;
        var distance = 0;
        var ascentDurationInSeconds = 0;
        for (var i = 0; i < altitudeArray.length; i++) {
            if (i > 0 && velocityArray[i] * 3.6 > ActivityComputer.MOVING_THRESHOLD_KPH) {
                durationInSeconds = (timeArray[i] - timeArray[i - 1]);
                distance = distanceArray[i] - distanceArray[i - 1];
                accumulatedElevation += this.valueForSum(altitudeArray[i], altitudeArray[i - 1], distance);
                elevationSampleCount += distance;
                elevationSamples.push(altitudeArray[i]);
                elevationSamplesDistance.push(distance);
                var elevationZoneId = this.getZoneId(this.userSettings.zones.elevation, altitudeArray[i]);
                if (!_.isUndefined(elevationZoneId) && !_.isUndefined(elevationZones[elevationZoneId])) {
                    elevationZones[elevationZoneId].s += durationInSeconds;
                }
                var elevationDiff = altitudeArray[i] - altitudeArray[i - 1];
                if (elevationDiff > 0) {
                    accumulatedElevationAscent += elevationDiff;
                    ascentDurationInSeconds = timeArray[i] - timeArray[i - 1];
                    var ascentSpeedMeterPerHour = elevationDiff / ascentDurationInSeconds * 3600;
                    if (distance > 0 && (elevationDiff / distance * 100) > ActivityComputer.ASCENT_SPEED_GRADE_LIMIT) {
                        accumulatedDistance += distanceArray[i] - distanceArray[i - 1];
                        ascentSpeedMeterPerHourSamples.push(ascentSpeedMeterPerHour);
                        ascentSpeedMeterPerHourDistance.push(accumulatedDistance);
                        ascentSpeedMeterPerHourSum += ascentSpeedMeterPerHour;
                        var ascentSpeedZoneId = this.getZoneId(this.userSettings.zones.ascent, ascentSpeedMeterPerHour);
                        if (!_.isUndefined(ascentSpeedZoneId) && !_.isUndefined(ascentSpeedZones[ascentSpeedZoneId])) {
                            ascentSpeedZones[ascentSpeedZoneId].s += ascentDurationInSeconds;
                        }
                    }
                }
                else {
                    accumulatedElevationDescent -= elevationDiff;
                }
            }
        }
        var avgElevation = accumulatedElevation / elevationSampleCount;
        var avgAscentSpeed = ascentSpeedMeterPerHourSum / ascentSpeedMeterPerHourSamples.length;
        elevationZones = this.finalizeDistributionComputationZones(elevationZones);
        ascentSpeedZones = this.finalizeDistributionComputationZones(ascentSpeedZones);
        var percentilesElevation = Helper.weightedPercentiles(elevationSamples, elevationSamplesDistance, [0.25, 0.5, 0.75]);
        var percentilesAscent = Helper.weightedPercentiles(ascentSpeedMeterPerHourSamples, ascentSpeedMeterPerHourDistance, [0.25, 0.5, 0.75]);
        var ascentSpeedData = {
            avg: _.isFinite(avgAscentSpeed) ? avgAscentSpeed : -1,
            lowerQuartile: parseFloat(percentilesAscent[0].toFixed(0)),
            median: parseFloat(percentilesAscent[1].toFixed(0)),
            upperQuartile: parseFloat(percentilesAscent[2].toFixed(0))
        };
        var elevationData = {
            avgElevation: parseFloat(avgElevation.toFixed(0)),
            accumulatedElevationAscent: accumulatedElevationAscent,
            accumulatedElevationDescent: accumulatedElevationDescent,
            lowerQuartileElevation: parseFloat(percentilesElevation[0].toFixed(0)),
            medianElevation: parseFloat(percentilesElevation[1].toFixed(0)),
            upperQuartileElevation: parseFloat(percentilesElevation[2].toFixed(0)),
            elevationZones: (this.returnZones) ? elevationZones : null,
            ascentSpeedZones: (this.returnZones) ? ascentSpeedZones : null,
            ascentSpeed: ascentSpeedData
        };
        if (skipAscentSpeedCompute) {
            elevationData = _.omit(elevationData, 'ascentSpeedZones');
            elevationData = _.omit(elevationData, 'ascentSpeed');
        }
        return elevationData;
    };
    ActivityComputer.prototype.smoothAltitude = function (activityStream, stravaElevation) {
        if (!activityStream || !activityStream.altitude) {
            return null;
        }
        var activityAltitudeArray = activityStream.altitude;
        var distanceArray = activityStream.distance;
        var velocityArray = activityStream.velocity_smooth;
        var smoothingL = 10;
        var smoothingH = 600;
        var smoothing;
        var altitudeArray = [];
        while (smoothingH - smoothingL >= 1) {
            smoothing = smoothingL + (smoothingH - smoothingL) / 2;
            altitudeArray = this.lowPassDataSmoothing(activityAltitudeArray, distanceArray, smoothing);
            var totalElevation = 0;
            for (var i = 0; i < altitudeArray.length; i++) {
                if (i > 0 && velocityArray[i] * 3.6 > ActivityComputer.MOVING_THRESHOLD_KPH) {
                    var elevationDiff = altitudeArray[i] - altitudeArray[i - 1];
                    if (elevationDiff > 0) {
                        totalElevation += elevationDiff;
                    }
                }
            }
            if (totalElevation < stravaElevation) {
                smoothingH = smoothing;
            }
            else {
                smoothingL = smoothing;
            }
        }
        return altitudeArray;
    };
    ActivityComputer.prototype.lowPassDataSmoothing = function (data, distance, smoothing) {
        var smooth_factor = 0;
        var result = [];
        if (data && distance) {
            result[0] = data[0];
            for (var i = 1, max = data.length; i < max; i++) {
                if (smoothing === 0) {
                    result[i] = data[i];
                }
                else {
                    smooth_factor = smoothing / (distance[i] - distance[i - 1]);
                    result[i] = result[i - 1] + (data[i] - result[i - 1]) / (smooth_factor > 1 ? smooth_factor : 1);
                }
            }
        }
        return result;
    };
    ActivityComputer.MOVING_THRESHOLD_KPH = 3.5;
    ActivityComputer.CADENCE_THRESHOLD_RPM = 35;
    ActivityComputer.GRADE_CLIMBING_LIMIT = 1.6;
    ActivityComputer.GRADE_DOWNHILL_LIMIT = -1.6;
    ActivityComputer.GRADE_PROFILE_FLAT_PERCENTAGE_DETECTED = 60;
    ActivityComputer.GRADE_PROFILE_FLAT = 'FLAT';
    ActivityComputer.GRADE_PROFILE_HILLY = 'HILLY';
    ActivityComputer.ASCENT_SPEED_GRADE_LIMIT = ActivityComputer.GRADE_CLIMBING_LIMIT;
    ActivityComputer.AVG_POWER_TIME_WINDOW_SIZE = 30;
    return ActivityComputer;
}());
