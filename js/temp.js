function smoothScroll(target, time, startpos) {
    // time when scroll starts
    var start = new Date().getTime(),

        // set an interval to update scrollTop attribute every 25 ms
        timer = setInterval(function() {

            // calculate the step, i.e the degree of completion of the smooth scroll 
            var step = Math.min(1, (new Date().getTime() - start) / time) + startpos;

            // calculate the scroll distance and update the scrollTop
            document.getElementById("pinpointContainer").scrollTop = (step * target.offsetTop);
console.log(document.getElementById("pinpointContainer").scrollTop)
            // end interval if the scroll is completed
            if (document.getElementById("pinpointContainer").scrollTop >= target.offsetTop || (document.getElementById("pinpointContainer").scrollTop === (document.getElementById("pinpointContainer").scrollHeight - document.getElementById("pinpointContainer").offsetHeight))) clearInterval(timer);
        }, 25);
} 

// temporary scroll function
