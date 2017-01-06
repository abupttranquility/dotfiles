var counter_timer_left = 0;
var bg_counter_timer;
var timer_type = "";

function bg_counter(mins) {
    var original_date = new Date().getTime();
    var minutes, seconds, timer_mins;

    if(bg_counter_timer != "") {
        clearTimeout(bg_counter_timer);
        bg_counter_timer = "";
    }

    bg_counter_timer = setInterval(function () {
        var current_date = new Date().getTime();
        var seconds_left = (current_date - original_date) / 1000;

        minutes = parseInt(seconds_left / 60);
        seconds = parseInt(seconds_left % 60);
        var secs = seconds * 100 / 6000;
        timer_mins = minutes + secs;
        timer_mins = timer_mins.toFixed(2);
        counter_timer_left = mins - timer_mins;
        // console.log(counter_timer_left);

        // console.log(minutes + "m, " + seconds + "s");

        if(counter_timer_left <= 0) {
            stop_timer();
        }
    }, 1000);
}

function stop_timer() {
    reset_bg_timer();
    counter_timer_left = 0;

    chrome.storage.sync.get( 'timer_type', function(items) {
		timer_type = items.timer_type;
		console.log(timer_type);

        var title = "";
		var message = "";
		var icon = "icon_64";
	    if(timer_type == "pomodoro") {
	        // console.log("pomodoro finished");
            title = "Pomodoro has ended!";
            message  = "Have you been productive?\nDo you remember everything you did?\nCan you see any progress?";
            message += "\n\nTake a break, you earned it!";
	    } else if(timer_type == "break") {
	        // console.log("break finished");
            title = "Break is over!";
            message = "Time to be productive again.\n\nWhat can you accomplish in 25 minutes?";
            icon = "coffee_64";
	    } else if(timer_type == "reset") {
	        // console.log("counter reset");
            title = "reset";
	        message = "Counter reset";
	    }

        if(title != "reset") {
            // show notification
            var opts = {
                type: 'basic',
                title: title,
                message: message,
                iconUrl: '../images/' + icon + '.png'
            };
            var nofunc = function() { return false; }
            chrome.notifications.create('pomodoro', opts, nofunc);

    		document.getElementById('player').play();
        }
	});
}

function reset_bg_timer() {
	clearTimeout(bg_counter_timer);
    bg_counter_timer = "";
}
