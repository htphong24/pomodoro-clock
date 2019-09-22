$(document).ready(function() {
    // - when counting down -> lock changing break & session length
    // - when changing session length
    //  + change session length
    let clock = new Object();
    let TITLE_SESSION = 1;
    let TITLE_BREAK = 0;
    let STATE_PLAYING = 1;
    let STATE_PAUSED = -1;
    let STATE_READY = 0;
    let BREAK_LENGTH_DEF = 1;
    let BREAK_LENGTH_MIN = 1;
    let BREAK_LENGTH_MAX = 15;
    let SESSION_LENGTH_DEF = 25;
    let SESSION_LENGTH_MIN = 1;
    let SESSION_LENGTH_MAX = 60;
    let timeInterval;
  
    function getTimeRemaining(endtime) {
      /// <summary>Gets remaining time</summary>
      /// <param name="endtime" type="Date">e.g. Fri Sep 30 2016 17:18:14 GMT+0700 (SE Asia Standard Time)</param>
      /// <returns type="Object">e.g. { 'total': <number of miliseconds>, 'days': <number of days>, 'hours': <number of hours>, 'minutes': <number of minutes>, 'seconds': <number of seconds> }</returns>
      var t = Date.parse(endtime) - Date.parse(new Date());
      var seconds = Math.floor((t / 1000) % 60);
      var minutes = Math.floor((t / 1000 / 60) % 60);
      var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
      var days = Math.floor(t / (1000 * 60 * 60 * 24));
      return {
        total: t,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
      };
    }
  
    let formatTime = (minutes, seconds) => {
      /// <summary>Format clock's time</summary>
      /// <param name="minutes" type="Number">e.g. 2</param>
      /// <param name="seconds" type="Number">e.g. 36</param>
      /// <returns type="String">e.g. 02:36</returns>
      var minuteInStr = ("0" + minutes).slice(-2);
      var secondInStr = ("0" + seconds).slice(-2);
      return minuteInStr + ":" + secondInStr;
    };
  
    let clickClock = () => {
      /// <summary>Clicks the timer</summary>
      /// <param name="" type="Number"></param>
      /// <returns type="Number"></returns>
      let deadline;
      let minutes;
      let countdown = () => {
        let t = getTimeRemaining(deadline);
        clock.totalTime = t.total;
        clock.totalMinutes = t.minutes;
        clock.totalSeconds = t.seconds;
        minutes =
          clock.title == TITLE_SESSION ? clock.sessionLength : clock.breakLength;
        clock.percent = 100 - t.total / (minutes * 60 * 1000) * 100;
        //$(".duration").html(formatTime(clock.totalMinutes, clock.totalSeconds));
        display();
        if (clock.totalTime <= 0) {
          clock.title =
            clock.title == TITLE_SESSION ? TITLE_BREAK : TITLE_SESSION;
          minutes =
            clock.title == TITLE_SESSION
              ? clock.sessionLength
              : clock.breakLength;
          deadline = new Date(Date.parse(new Date()) + minutes * 60 * 1000);
        }
      };
  
      switch (clock.state) {
        case STATE_READY:
          clock.state = STATE_PLAYING;
          minutes =
            clock.title == TITLE_SESSION
              ? clock.sessionLength
              : clock.breakLength;
          //minutes = 1;
          deadline = new Date(Date.parse(new Date()) + minutes * 60 * 1000);
          clock.percent = 0;
          countdown();
          timeInterval = setInterval(countdown, 1000);
          break;
        case STATE_PLAYING:
          clock.state = STATE_PAUSED;
          clearInterval(timeInterval);
          break;
        case STATE_PAUSED:
          clock.state = STATE_PLAYING;
          deadline = new Date(Date.parse(new Date()) + clock.totalTime);
          countdown();
          timeInterval = setInterval(countdown, 1000);
          break;
        default:
          break;
      }
    };
  
    let reset = () => {
      /// <summary>Resets clock's properties</summary>
      clock.breakLength = BREAK_LENGTH_DEF;
      clock.sessionLength = SESSION_LENGTH_DEF;
      clock.title = TITLE_SESSION;
      clock.state = STATE_READY;
      clock.totalMinutes = parseInt($(".session .length").html());
      clock.totalSeconds = 0;
      clock.totalTime = clock.totalMinutes * 60 * 1000;
      clock.percent = 0;
      clock.breakLengthChanged = false;
      clock.sessionLengthChanged = false;
    };
  
    let display = () => {
      /// <summary>Displays clock's properties</summary>
      // length
      $(".break .length").html(clock.breakLength);
      $(".session .length").html(clock.sessionLength);
      // title
      $(".timer .title").html(
        clock.title == TITLE_SESSION ? "Session" : "Break!"
      );
      // fill
      $(".timer .fill").height(clock.percent + "%");
      $(".timer .fill").css(
        "background-color",
        clock.title == TITLE_SESSION ? "Green" : "Red"
      );
      // duration
      if (clock.state == STATE_PLAYING) {
        $(".timer .duration").html(
          formatTime(clock.totalMinutes, clock.totalSeconds)
        );
      } else {
        //console.log(clock.state == STATE_PAUSED && clock.breakLengthChanged);
        if (
          clock.state == STATE_PAUSED &&
          clock.breakLengthChanged &&
          clock.title == TITLE_BREAK
        )
          $(".timer .duration").html(clock.breakLength);
        else if (
          clock.state == STATE_PAUSED &&
          clock.sessionLengthChanged &&
          clock.title == TITLE_SESSION
        )
          $(".timer .duration").html(clock.sessionLength);
        else if (clock.state == STATE_READY)
          $(".timer .duration").html(
            clock.title == TITLE_SESSION ? clock.sessionLength : clock.breakLength
          );
        else {
        }
      }
      // break/session's length has been changed (clicked)
      clock.breakLengthChanged = false;
      clock.sessionLengthChanged = false;
    };
  
    let changeBreakLength = changingCmd => {
      // changingCmd: "decrease" or "increase"
      if (clock.state != STATE_PLAYING) {
        changingCmd == "decrease"
          ? clock.breakLength > BREAK_LENGTH_MIN
            ? clock.breakLength--
            : clock.breakLength
          : clock.breakLength < BREAK_LENGTH_MAX
            ? clock.breakLength++
            : clock.breakLength;
        if (clock.title == TITLE_BREAK) {
          clock.state = STATE_READY;
          clock.totalMinutes = clock.breakLength;
          clock.totalSeconds = 0;
          clock.totalTime = clock.totalMinutes * 60 * 1000;
        }
        clock.breakLengthChanged = true;
        display();
      }
    };
  
    let changeSessionLength = changingCmd => {
      // changingCmd: "decrease" or "increase"
      if (clock.state != STATE_PLAYING) {
        changingCmd == "decrease"
          ? clock.sessionLength > SESSION_LENGTH_MIN
            ? clock.sessionLength--
            : clock.sessionLength
          : clock.sessionLength < SESSION_LENGTH_MAX
            ? clock.sessionLength++
            : clock.sessionLength;
        if (clock.title == TITLE_SESSION) {
          clock.state = STATE_READY;
          clock.totalMinutes = clock.sessionLength;
          clock.totalSeconds = 0;
          clock.totalTime = clock.totalMinutes * 60 * 1000;
        }
        clock.sessionLengthChanged = true;
        display();
      }
    };
  
    $(".break .minus").bind("click", function(event) {
      changeBreakLength("decrease");
    });
    $(".break .plus").bind("click", function(event) {
      changeBreakLength("increase");
    });
    $(".session .minus").bind("click", function(event) {
      changeSessionLength("decrease");
    });
    $(".session .plus").bind("click", function(event) {
      changeSessionLength("increase");
    });
    $(".timer").bind("click", function(event) {
      clickClock();
    });
  
    reset();
    display();
    // during countdown (state = STATE_PLAYING) => lock increasing and decreasing break/session length
    // after increasing/decreasing break/session length => state = STATE_READY
  });
  
  /*
      function clickClock(id, endtime) {
          var clock = document.getElementById(id);
          var daysSpan = clock.querySelector('.days');
          var hoursSpan = clock.querySelector('.hours');
          var minutesSpan = clock.querySelector('.minutes');
          var secondsSpan = clock.querySelector('.seconds');
      
          function updateClock() {
              var t = getTimeRemaining(endtime);
      
              daysSpan.innerHTML = t.days;
              hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
              minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
              secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      
              if (t.total <= 0) {
                  clearInterval(timeinterval);
              }
          }
      
          updateClock();
          var timeinterval = setInterval(updateClock, 1000);
      }
  */
  