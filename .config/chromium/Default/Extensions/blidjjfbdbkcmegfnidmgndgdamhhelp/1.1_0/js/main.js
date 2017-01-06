/*
** file: js/main.js
** description: javascript code for "html/main.html" page
*/

function init_main () {
    $('html').hide().fadeIn('slow');
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);

var timeout, bg_counter_timer, counter_timer_left;
var background = chrome.extension.getBackgroundPage();

$('*[rel=tooltip]').tooltip();

if(background.counter_timer_left > 0) {
	// timer is counting
	show_reset();
	var mins = background.counter_timer_left;
    var left_length = parseInt( mins * 54 );
    $(".counter").css( { transitionDuration: ".0s", left: "-" + left_length + "px" } );
    timeout = setTimeout('start_timer('+mins+')', 200);
} else {
	// timer is stopped
	hide_reset();
}

$(".start_pomodoro").on("click", function(e) {
    e.preventDefault();
    var mins = 25;
    var left_length = parseInt( mins * 54 );
    $(".counter").css( { transitionDuration: ".8s", left: "-" + left_length + "px" } );
    // background.timer_type = "pomodoro";
    chrome.storage.sync.set( { 'timer_type': 'pomodoro' }, function() { console.log('saved!') } );
    timeout = setTimeout('start_timer('+mins+')', 1000);
    show_reset();
});
$(".break_pomodoro").on("click", function(e) {
    e.preventDefault();
    var mins = 5;
    var left_length = parseInt( mins * 54 );
    $(".counter").css( { transitionDuration: ".3s", left: "-" + left_length + "px" } );
    // background.timer_type = "break";
    chrome.storage.sync.set( { 'timer_type': 'break' }, function() { console.log('saved!') } );
    timeout = setTimeout('start_timer('+mins+')', 500);
    show_reset();
});
$(".medium_break_pomodoro").on("click", function(e) {
    e.preventDefault();
    var mins = 10;
    var left_length = parseInt( mins * 54 );
    $(".counter").css( { transitionDuration: ".3s", left: "-" + left_length + "px" } );
    // background.timer_type = "medium break";
    chrome.storage.sync.set( { 'timer_type': 'break' }, function() { console.log('saved!') } );
    timeout = setTimeout('start_timer('+mins+')', 500);
    show_reset();
});
$(".long_break_pomodoro").on("click", function(e) {
    e.preventDefault();
    var mins = 15;
    var left_length = parseInt( mins * 54 );
    $(".counter").css( { transitionDuration: ".3s", left: "-" + left_length + "px" } );
    // background.timer_type = "long break";
    chrome.storage.sync.set( { 'timer_type': 'break' }, function() { console.log('saved!') } );
    timeout = setTimeout('start_timer('+mins+')', 500);
    show_reset();
});
$(".reset_pomodoro").on("click", function(e) {
    e.preventDefault();
    $(".counter").css( { transitionDuration: ".5s", left: "-1px" } );
    // background.timer_type = "reset";
    chrome.storage.sync.set( { 'timer_type': 'reset' }, function() { console.log('saved!') } );
    timeout = setTimeout('reset_timer()', 700);
    hide_reset();
});

function start_timer(mins) {
    var timer_total = 60 * mins;
    $(".counter").css( { transitionDuration: timer_total + "s", left: "0px" } );
    background.bg_counter(mins);
    clearTimeout(timeout);
}
function reset_timer() {
	$(".counter").css( { transitionDuration: "0s", left: "0px" } );
    background.stop_timer();
    clearTimeout(timeout);
}

function show_reset() {
    $(".start_group").hide();
    $(".reset_group").show();
}
function hide_reset() {
    $(".start_group").show();
    $(".reset_group").hide();
}

/*
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
        background.counter_timer_left = counter_timer_left;

        // console.log(minutes + "m, " + seconds + "s");

        if(counter_timer_left == 0) {
            stop_timer(mins);
        }
    }, 1000);
}
*/
