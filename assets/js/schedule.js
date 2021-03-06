var data;
var d = new Date();
var weekStart;
var currDay;

window.onload = function(){
    loadJSON(function(res){
        data = res;

        var today = d.getDate();
        if (today < 8){
            weekStart = 1;
        } else if (today < 15){
             weekStart = 8;
        } else if (today < 22){
            weekStart = 15;
        } else if (today < 29){
            weekStart = 22;
        } else {
            weekStart = 29;
        }

        loadTimezone();
        loadAxis();
        loadSchedule();

        document.getElementById("prevWeek").addEventListener('click', prevWeek);
        document.getElementById("nextWeek").addEventListener('click', nextWeek);
        document.getElementById("prevDay").addEventListener('click', prevDay);
        document.getElementById("nextDay").addEventListener('click', nextDay);
    });
}

function clearActive(callback){
    var activeElems = document.getElementsByClassName(`day${["one","two","three","four","five","six","seven"][currDay]}`);
    for (var i = 0; i < activeElems.length; i++){
        activeElems[i].classList.remove("active");
    }
    callback();
}

function prevDay(){
    if (currDay !== 0){
        clearActive(() => {
            currDay -= 1;
            loadMobile();
        });
    } else if (currDay === 0 && weekStart !== 1){
        var weekNo = parseInt(((weekStart - 1) / 7) + 1);
        if (data["week"+parseInt(weekNo - 1)].meta.active){
            clearActive(() => {
                currDay = 6;
                prevWeek();
            });
        }
    }
}

function nextDay(){
    if (currDay !== 6){
        clearActive(() => {
            currDay += 1;
            loadMobile();
        });
    } else if (currDay === 6 && weekStart !== 29){
        var weekNo = parseInt(((weekStart - 1) / 7) + 1);
        if (data["week"+parseInt(weekNo + 1)].meta.active){
            clearActive(() => {
                currDay = 0;
                nextWeek();
            });
        }
    }
}

function prevWeek(){
    var weekNo = parseInt(((weekStart - 1) / 7) + 1);
    if (weekNo !== 1){
        if (data["week"+parseInt(weekNo - 1)].meta.active){
            weekStart -= 7;

            document.getElementById("schedule").innerHTML = '';

            loadTimezone();
            loadAxis();
            loadSchedule();
        }
    }
}

function nextWeek(){
    var weekNo = parseInt(((weekStart - 1) / 7) + 1);
    if (weekStart !== 29){
        if (data["week"+parseInt(weekNo + 1)].meta.active){
            weekStart += 7;

            document.getElementById("schedule").innerHTML = '';
        
            loadTimezone();
            loadAxis();
            loadSchedule();
        }
    }
}

function loadJSON(callback){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'https://yogs.ryanoconr.com/events.json?t='+Date.now(), true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200"){
            callback(JSON.parse(xobj.response));
        }
    };
    xobj.send(null);
}

function buildDay(data, day){
    var dayVodEl = document.createElement("div");
    dayVodEl.classList.add("vod");
    if (data.madcat !== undefined) {
        var dayVodLinkEl = document.createElement("a");
        dayVodEl.innerText = "Watch vod";
        
        var madcatIcon = document.createElement("i");
        
        madcatIcon.classList.add("fas");
        madcatIcon.classList.add("fa-paw");
        
        dayVodLinkEl.appendChild(madcatIcon);
        
        dayVodLinkEl.setAttribute("href", data.madcat);
        dayVodLinkEl.setAttribute("target", "_blank");
        dayVodLinkEl.setAttribute("title", "Watch recap");

        dayVodEl.appendChild(dayVodLinkEl);
        
        var headerEl = document.querySelector(`.header.${day}`);
        
        headerEl.insertAdjacentElement('afterbegin', dayVodEl);
    } else {
        dayVodEl.classList.add("upcoming");
        dayVodEl.innerText = "Awaiting vod";
    }
    var headerEl = document.querySelector(`.header.${day}`);
    headerEl.insertAdjacentElement('afterbegin', dayVodEl);

    Object.keys(data.events).forEach(e => {
        var title = (data.events[e].title !== undefined) ? data.events[e].title : "";
        var subtitle = (data.events[e].subtitle !== undefined) ? data.events[e].subtitle : "";
        var subtitle2 = (data.events[e].subtitle2 !== undefined) ? data.events[e].subtitle2 : "";
        var info = (data.events[e].info !== undefined) ? data.events[e].info : "";
        var extra = (data.events[e].extra !== undefined) ? data.events[e].extra : "";
        var type = (data.events[e].type !== undefined) ? data.events[e].type : "";
        var double = type.indexOf('double') >= 0;

        // bonus event details
        var bonus = (data.events[e].bonus !== undefined) ? data.events[e].bonus : "";

        var eventDate = data.date;
        var eventHour = data.events[e].startHour;
        var eventEnd = eventHour + (double ? 6 : 3);
        var utc = d.getUTCDate();
        var utcHours = d.getUTCHours();

        var event = document.createElement("div");
        event.classList.add(day);
        double ? event.classList.add("double") : null;
        event.classList.add(eventHour === 11 ? "morning" : eventHour === 14 ? "afternoon" : eventHour === 17 ? "evening" : "night");

        if (type !== ""){
            var classes = type.split(" ");

            for (i = 0; i < classes.length; i++){
                if (classes[i] !== ""){
                    event.classList.add(classes[i]);
                }
            }
        }

        var center = document.createElement("div");

        if (title !== ""){
            var h1 = document.createElement("h1");
            title = title.replace(/\n/g, "<br />");
            h1.innerHTML = title;
            center.appendChild(h1);
        }

        if (info !== ""){
            var h3 = document.createElement("h3");
            info = info.replace(/\n/g, "<br />");
            h3.innerHTML = info;
            center.appendChild(h3);
        }

        if (subtitle !== ""){
            var h2 = document.createElement("h2");
            subtitle = subtitle.replace(/\n/g, "<br />");
            h2.innerHTML = subtitle;
            center.appendChild(h2);
        }

        if (subtitle2 !== ""){
            var h2 = document.createElement("h2");
            subtitle2 = subtitle2.replace(/\n/g, "<br />");
            h2.innerHTML = subtitle2;
            center.appendChild(h2);
        }

        if (extra !== ""){
            var h1 = document.createElement("h1");
            extra = extra.replace(/\n/g, "<br />");
            h1.innerHTML = extra;
            center.appendChild(h1);
        }

        // create vod overlay
        if (data.events[e].vods !== undefined){
            var vods = document.createElement("div");
            var vodc = document.createElement("div");
            vodc.classList.add("vodc");
            vods.classList.add("vods");

            var vodh1 = document.createElement("h1");
            vodh1.innerText = "watch vod";
            vodc.appendChild(vodh1);

            if (data.events[e].vods.twitch !== undefined && data.events[e].vods.twitch !== ""){
                var twitch = document.createElement("a");
                var twitchIcon = document.createElement("i");

                twitchIcon.classList.add("fab");
                twitchIcon.classList.add("fa-twitch");

                twitch.setAttribute("href", data.events[e].vods.twitch);
                twitch.setAttribute("target", "_blank");
                twitch.setAttribute("title", "Watch on twitch");

                twitch.appendChild(twitchIcon);
                vodc.appendChild(twitch);
            }

            if (data.events[e].vods.youtube !== undefined && data.events[e].vods.youtube !== ""){
                var youtube = document.createElement("a");
                var youtubeIcon = document.createElement("i");
                
                youtubeIcon.classList.add("fab");
                youtubeIcon.classList.add("fa-youtube");

                youtube.setAttribute("href", data.events[e].vods.youtube);
                youtube.setAttribute("target", "_blank");
                youtube.setAttribute("title", "Watch on YouTube");

                youtube.appendChild(youtubeIcon);
                vodc.appendChild(youtube);
            }

            if (data.events[e].vods.madcat !== undefined && data.events[e].vods.madcat !== ""){
                var madcat = document.createElement("a");
                var madcatIcon = document.createElement("i");

                madcatIcon.classList.add("fas");
                madcatIcon.classList.add("fa-paw");

                madcat.setAttribute("href", data.events[e].vods.madcat);
                madcat.setAttribute("target", "_blank");
                madcat.setAttribute("title", "Watch recap");

                madcat.appendChild(madcatIcon);
                vodc.appendChild(madcat);
            }

            vods.appendChild(vodc);

            event.appendChild(vods);
        } else {
            var vods = document.createElement("div");
            var vodc = document.createElement("div");
            vodc.classList.add("vodc");
            vods.classList.add("vods");
            if (eventDate < utc || (eventEnd <= utcHours && eventDate == utc)){
                var vodh1 = document.createElement("h1");
                vodh1.innerText = "awaiting vod";
                vodc.appendChild(vodh1);

                var twitch = document.createElement("a");
                var twitchIcon = document.createElement("i");

                twitchIcon.classList.add("fab");
                twitchIcon.classList.add("fa-twitch");

                twitch.setAttribute("href", "https://twitch.tv/yogscast");
                twitch.setAttribute("target", "_blank");
                twitch.setAttribute("title", "Watch live");

                twitch.appendChild(twitchIcon);
                vodc.appendChild(twitch);
            } else if (eventHour <= utcHours && eventEnd >= utcHours && eventDate == utc){
                var vodh1 = document.createElement("h1");
                vodh1.innerText = "watch live";
                vodc.appendChild(vodh1);

                var twitch = document.createElement("a");
                var twitchIcon = document.createElement("i");

                twitchIcon.classList.add("fab");
                twitchIcon.classList.add("fa-twitch");

                twitch.setAttribute("href", "https://twitch.tv/yogscast");
                twitch.setAttribute("target", "_blank");
                twitch.setAttribute("title", "Watch live");

                twitch.appendChild(twitchIcon);
                vodc.appendChild(twitch);
            } else if (utcHours >= eventHour - 1 && eventDate == utc){
                var vodh1 = document.createElement("h1");
                vodh1.innerText = "starting soon";
                vodc.appendChild(vodh1);

                var twitch = document.createElement("a");
                var twitchIcon = document.createElement("i");

                twitchIcon.classList.add("fab");
                twitchIcon.classList.add("fa-twitch");

                twitch.setAttribute("href", "https://twitch.tv/yogscast");
                twitch.setAttribute("target", "_blank");
                twitch.setAttribute("title", "Watch live");

                twitch.appendChild(twitchIcon);
                vodc.appendChild(twitch);
            } else {
                var vodh1 = document.createElement("h1");
                vodh1.innerText = "stream has not begun";
                vodc.appendChild(vodh1);

                event.classList.add("upcoming");
            }
            vods.appendChild(vodc);

            event.appendChild(vods);
        }

        center.classList.add("center");

        event.appendChild(center);

        if (bonus !== ""){
            var bonusElem = document.createElement("div");
            bonusElem.classList.add("bonus");

            var timezoneOffset = d.getTimezoneOffset() / 60;

            var bonusTime = document.createElement("h5");

            var bonusStart = parseInt(bonus.startHour) - timezoneOffset;
            var bonusEnd = parseInt(bonus.endHour) - timezoneOffset;

            if (bonusStart > 23){
                bonusStart -= 24;
            } else if (bonusStart < 0){
                bonusStart += 24;
            }

            if (bonusEnd > 23){
                bonusEnd -= 24;
            } else if (bonusEnd < 0){
                bonusEnd += 24;
            }

            if (bonusStart < 10){
                bonusStart = "0" + bonusStart;
            }

            if (bonusEnd < 10){
                bonusEnd = "0" + bonusEnd;
            }

            bonusStart = bonusStart + ":00";
            bonusEnd = bonusEnd  + ":00";

            bonusTime.innerText = bonusStart + " - " + bonusEnd;

            var bonusTitle = document.createElement("h4");
            bonusTitle.innerText = bonus.title;

            var bonusSubtitle = document.createElement("h6");
            bonusSubtitle.innerText = bonus.subtitle;

            bonusElem.appendChild(bonusTime);
            bonusElem.appendChild(bonusTitle);
            bonusElem.appendChild(bonusSubtitle);

            event.appendChild(bonusElem);

            event.classList.add("bonus");
        }

        document.getElementById("schedule").appendChild(event);
    });
}

function loadSchedule(){
    var events;

    var weekno = document.getElementById("weekno");

        if (weekStart < 8){
            events = data.week1;
            weekno.innerText = "week 1";
        } else if (weekStart < 15){
            events = data.week2;
            weekno.innerText = "week 2";
        } else if (weekStart < 22){
            events = data.week3;
            weekno.innerText = "week 3";
        } else if (weekStart < 29){
            events = data.week4;
            weekno.innerText = "week 4";
        } else {
            events = data.week5;
            weekno.innerText = "week 5";
        }

        if (events.meta.active){

            buildDay(events.sat, "dayone")
            buildDay(events.sun, "daytwo");
            buildDay(events.mon, "daythree");
            buildDay(events.tue, "dayfour");
            buildDay(events.wed, "dayfive");
            buildDay(events.thur, "daysix");
            buildDay(events.fri, "dayseven");
            loadMobile();
        }
}

function loadMobile(){
    if (currDay === undefined){
        currDay = d.getDay() + 1;
    }
    if (currDay > 6){
        currDay -= 7;
    }

    var activeElems = document.getElementsByClassName(`day${["one","two","three","four","five","six","seven"][currDay]}`);
    for (var i = 0; i < activeElems.length; i++){
        activeElems[i].classList.add("active");
    }
}

function loadTimezone(){
    var timeHeader = document.createElement("div");
    timeHeader.classList.add("time");
    timeHeader.classList.add("header");

    document.getElementById("schedule").appendChild(timeHeader);

    var timezone = d.toLocaleTimeString('en-us', {timeZoneName: 'short'}).split(' ')[2];
    document.querySelector('.header.time').innerHTML = timezone;
}

function loadAxis(){
    var schedule = document.getElementById("schedule");

    var morning = document.createElement("div");
    morning.classList.add("time");
    morning.classList.add("morning");
    morning.setAttribute("data-label", "morning");

    var afternoon = document.createElement("div");
    afternoon.classList.add("time");
    afternoon.classList.add("afternoon");
    afternoon.setAttribute("data-label", "afternoon");

    var evening = document.createElement("div");
    evening.classList.add("time");
    evening.classList.add("evening");
    evening.setAttribute("data-label", "evening");

    var night = document.createElement("div");
    night.classList.add("time");
    night.classList.add("night");
    night.setAttribute("data-label", "night");

    var timezoneOffset = d.getTimezoneOffset() / 60;

    var morningStart = document.createElement("p");
    var morningEnd = document.createElement("p");
    var afternoonStart = document.createElement("p");
    var afternoonEnd = document.createElement("p");
    var eveningStart = document.createElement("p");
    var eveningEnd = document.createElement("p");
    var nightStart = document.createElement("p");
    var nightEnd = document.createElement("p");

    var times = [11 - timezoneOffset, 14 - timezoneOffset, 17 - timezoneOffset, 20 - timezoneOffset, 23 - timezoneOffset];

    var days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

    if (times[0] < 0){
        days.unshift("friday");
        days.pop();
        weekStart -= 1;
    } else if (times[0] > 24){
        days.shift();
        days.push("saturday");
        weekStart += 1;
    }

    Object.keys(times).forEach(e => {
        if (times[e] < 0){
            times[e] += 24;
        } else if (times[e] > 24){
            times[e] -= 24;
        }
    });

    morningStart.innerText = (times[0] < 10 ? "0" + times[0] :  times[0])+ ":00";
    morningEnd.innerText = afternoonStart.innerText = (times[1] < 10 ? "0" + times[1] : times[1]) + ":00";
    afternoonEnd.innerText = eveningStart.innerText = (times[2] < 10 ? "0" + times[2] : times[2]) + ":00";
    eveningEnd.innerText = nightStart.innerText = (times[3] < 10 ? "0" + times[3] : times[3]) + ":00";
    nightEnd.innerText = (times[4] < 10 ? "0" + times[4] : times[4]) + ":00";

    morning.appendChild(morningStart);
    morning.appendChild(morningEnd);

    schedule.appendChild(morning);

    afternoon.appendChild(afternoonStart);
    afternoon.appendChild(afternoonEnd);

    schedule.appendChild(afternoon);

    evening.appendChild(eveningStart);
    evening.appendChild(eveningEnd);

    schedule.appendChild(evening);

    night.appendChild(nightStart);
    night.appendChild(nightEnd);

    schedule.appendChild(night);

    var dayone = document.createElement("div");
    var dayoneDate = document.createElement("div");
    dayoneDate.classList.add("date");
    dayone.classList.add("header");
    dayone.classList.add("dayone");
    dayone.appendChild(dayoneDate);

    var daytwo = document.createElement("div");
    var daytwoDate = document.createElement("div");
    daytwoDate.classList.add("date");
    daytwo.classList.add("header");
    daytwo.classList.add("daytwo");
    daytwo.appendChild(daytwoDate);
    
    var daythree = document.createElement("div");
    var daythreeDate = document.createElement("div");
    daythreeDate.classList.add("date");
    daythree.classList.add("header");
    daythree.classList.add("daythree");
    daythree.appendChild(daythreeDate);

    var dayfour = document.createElement("div");
    var dayfourDate = document.createElement("div");
    dayfourDate.classList.add("date");
    dayfour.classList.add("header");
    dayfour.classList.add("dayfour");
    dayfour.appendChild(dayfourDate);

    var dayfive = document.createElement("div");
    var dayfiveDate = document.createElement("div");
    dayfiveDate.classList.add("date");
    dayfive.classList.add("header");
    dayfive.classList.add("dayfive");
    dayfive.appendChild(dayfiveDate);

    var daysix = document.createElement("div");
    var daysixDate = document.createElement("div");
    daysixDate.classList.add("date");
    daysix.classList.add("header");
    daysix.classList.add("daysix");
    daysix.appendChild(daysixDate);

    var dayseven = document.createElement("div");
    var daysevenDate = document.createElement("div");
    daysevenDate.classList.add("date");
    dayseven.classList.add("header");
    dayseven.classList.add("dayseven");
    dayseven.appendChild(daysevenDate);

    var dates = [weekStart, weekStart + 1, weekStart + 2, weekStart + 3, weekStart + 4, weekStart + 5, weekStart + 6];

    Object.keys(dates).forEach(e => {
        if (dates[e] === 0){
            dates[e] = 30;
        } else if (dates[e] === 32){
            dates[e] = 1;
        }
    });

    dayoneDate.innerHTML = `${days[0]} ${dates[0]}<span>${dates[0] === (1 || 21 || 31) ? "st" : dates[0] === (2 || 22) ? "nd" : dates[0] === (3 || 23) ? "rd" : "th"}</span>`;
    daytwoDate.innerHTML = `${days[1]} ${dates[1]}<span>${dates[1] === (1 || 21 || 31) ? "st" : dates[1] === (2 || 22) ? "nd" : dates[1] === (3 || 23) ? "rd" : "th"}</span>`;
    daythreeDate.innerHTML = `${days[2]} ${dates[2]}<span>${dates[2] === (1 || 21 || 31) ? "st" : dates[2] === (2 || 22) ? "nd" : dates[2] === (3 || 23) ? "rd" : "th"}</span>`;
    dayfourDate.innerHTML = `${days[3]} ${dates[3]}<span>${dates[3] === (1 || 21 || 31) ? "st" : dates[3] === (2 || 22) ? "nd" : dates[3] === (3 || 23) ? "rd" : "th"}</span>`;
    dayfiveDate.innerHTML = `${days[4]} ${dates[4]}<span>${dates[4] === (1 || 21 || 31) ? "st" : dates[4] === (2 || 22) ? "nd" : dates[4] === (3 || 23) ? "rd" : "th"}</span>`;
    daysixDate.innerHTML = `${days[5]} ${dates[5]}<span>${dates[5] === (1 || 21 || 31) ? "st" : dates[5] === (2 || 22) ? "nd" : dates[5] === (3 || 23) ? "rd" : "th"}</span>`;
    daysevenDate.innerHTML = `${days[6]} ${dates[6]}<span>${dates[6] === (1 || 21 || 31) ? "st" : dates[6] === (2 || 22) ? "nd" : dates[6] === (3 || 23) ? "rd" : "th"}</span>`;

    schedule.appendChild(dayone);
    schedule.appendChild(daytwo);
    schedule.appendChild(daythree);
    schedule.appendChild(dayfour);
    schedule.appendChild(dayfive);
    schedule.appendChild(daysix);
    schedule.appendChild(dayseven);
}
