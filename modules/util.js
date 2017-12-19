#!/usr/bin/env node

function pad(time) {
    if (time < 10) {
        time = '0' + time;
    }
    return time;
}

module.exports = {

    getTime: function() {
        var now = new Date();
        var hours = pad(now.getHours());
        var minutes = pad(now.getMinutes());
        var seconds = pad(now.getSeconds());
        return hours + ':' + minutes + ':' + seconds;
    }

}