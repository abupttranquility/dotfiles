app.factory('AvoidInputKeysService', function () {
    var avoidInputKeysService = {
        apply: function (keyboardEvent) {
            if (keyboardEvent.keyCode !== 38 && keyboardEvent.keyCode !== 40 && keyboardEvent.keyCode !== 9 && keyboardEvent.keyCode !== 16) {
                keyboardEvent.preventDefault();
            }
        }
    };
    return avoidInputKeysService;
});
