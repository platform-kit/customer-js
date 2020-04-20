/*jshint esversion: 6 */

function initCrm(options) {
    if (typeof options == 'object') {
        if (options.hasOwnProperty('gist')) {
            if (options.gist.hasOwnProperty('appId')) {
                /* Gist */
                (function (d, h, w) {
                    var gist = w.gist = w.gist || []
                    gist.methods = ['trackPageView', 'identify', 'track', 'setAppId']
                    gist.factory = function (t) {
                        return function () {
                            var e = Array.prototype.slice.call(arguments)
                            e.unshift(t)
                            gist.push(e)
                            return gist
                        }
                    }
                    for (var i = 0; i < gist.methods.length; i++) {
                        var c = gist.methods[i]
                        gist[c] = gist.factory(c)
                    }
                    s = d.createElement('script'), s.src = 'https://widget.getgist.com', s.async = !0, e = d.getElementsByTagName(h)[0], e.appendChild(s), s.addEventListener('load', function (e) {}, !1), gist.setAppId(options.gist.appId), gist.trackPageView()
                })(document, 'head', window)
                console.log("Initialized Gist");
            }
        }
        if (options.hasOwnProperty('countly')) {
            if (options.countly.hasOwnProperty('appId') && options.countly.hasOwnProperty('url')) {
                // Some default pre init
                var Countly = Countly || {};
                Countly.q = Countly.q || [];

                // Provide your app key that you retrieved from Countly dashboard
                Countly.app_key = options.countly.appId;

                // Provide your server IP or name. Use try.count.ly or us-try.count.ly 
                // or asia-try.count.ly for EE trial server.
                // If you use your own server, make sure you have https enabled if you use
                // https below.
                Countly.url = options.countly.url;

                // Start pushing function calls to queue
                // Track sessions automatically (recommended)
                Countly.q.push(['track_sessions']);

                //track web page views automatically (recommended)
                Countly.q.push(['track_pageview']);

                // Uncomment the following line to track web heatmaps (Enterprise Edition)
                // Countly.q.push(['track_clicks']);

                // Uncomment the following line to track web scrollmaps (Enterprise Edition)
                // Countly.q.push(['track_scrolls']);

                // Load Countly script asynchronously
                (function () {
                    var cly = document.createElement('script');
                    cly.type = 'text/javascript';
                    cly.async = true;
                    // Enter url of script here (see below for other option)
                    cly.src = 'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/lib/countly.min.js';
                    cly.onload = function () {
                        Countly.init()
                    };
                    var s = document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(cly, s);
                })();
            }
        }
    } else {
        return null;
    }
}


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// detect which services on page
var detectedServices = [];
if (typeof gist !== 'undefined') {
    detectedServices.push('gist');
}
if (typeof window.intercomSettings !== 'undefined') {
    detectedServices.push('intercom');
}
if (typeof drift !== 'undefined') {
    detectedServices.push('drift');
}
if (typeof mixpanel !== 'undefined') {
    detectedServices.push('mixpanel');
}
if (typeof ga == 'function') {
    detectedServices.push('googleAnalytics');
}
if (typeof heap == 'object') {
    detectedServices.push('heap');
}
if (typeof Countly !== 'undefined') {
    detectedServices.push('countly');
}

/**
 * Identify the user on registered services
 * @param {string} identifier - Identifier assumed to always be emailId for now
 * @param {object} data
 */
function identify(identifier, data) {

    // Validation for email
    if (typeof identifier === 'string' && !validateEmail(identifier)) {
        console.error('Invalid entry for identification. Ensure valid email address or identifier object.');
        return;
    }

    // Gist
    if (detectedServices.includes('gist')) {
        if (data) {
            gist.identify(identifier, data);
        } else {
            gist.identify(identifier);
        }
    }

    // Intercom
    if (detectedServices.includes('intercom')) {
        window.intercomSettings.email = identifier;
    }

    // Drift
    if (detectedServices.includes('drift)')) {
        if (data) {
            drift.identify(identifier, data);
        } else {
            drift.identify(identifier);
        }
    }

    if (detectedServices.includes('mixpanel')) {
        if (data) {
            mixpanel.identify(identifier, data);
        } else {
            mixpanel.identify(identifier);
        }
    }

    if (detectedServices.includes('googleAnalytics')) {
        ga('set', 'userId', identifier);
    }

    if (detectedServices.includes('heap')) {
        heap.identify(identifier);
        if (data) {
            heap.addUserProperties(data);
        }
    }

    if (detectedServices.includes('countly')) {
        Countly.device_id = identifier;
        if (data) {
            let countlyData = {};
            const countlyKeys = ['name', 'username', 'email', 'organization', 'phone', 'picture', 'gender', 'byear'];
            Object.keys(data).forEach(key => {
                if (countlyKeys.includes(key)) {
                    countlyData[key] = data[key];
                } else {
                    countlyData.custom[key] = data[key];
                }
            });
            Countly.q.push(['user_details', countlyData]);
        }
    }

    var result = {};
    var input = {
        identifier: data
    };
    result.input = input;
    result.services = detectedServices;

    return result;
}

/**
 * Send custom event to registered services.
 * @param {string} eventName - the name of the event
 * @param {object} eventObject - the event parameters/metadata
 */
function sendEvent(eventName, eventObject) {
    // Gist
    if (detectedServices.includes('gist')) {
        gist.track(eventName, eventObject);
    }

    // Intercom
    if (detectedServices.includes('intercom')) {
        Intercom('trackEvent', eventName, eventObject);
    }

    // Drift
    if (detectedServices.includes('drift)')) {
        drift.track(eventName, eventObject);
    }

    // Mixpanel
    if (detectedServices.includes('mixpanel')) {
        mixpanel.track(eventName, eventObject);
    }

    // Google Analytics
    if (detectedServices.includes('googleAnalytics')) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'PlatformKit',
            eventAction: eventName
        });
    }

    // Heap
    if (detectedServices.includes('heap')) {
        heap.track(eventName, eventObject);
    }

    // Countly
    if (detectedServices.includes('countly')) {
        Countly.q.push(['add_event', {
            "key": eventName,
            "count": 1,
            "segmentation": eventObject
        }]);
    }
}

module.exports = {initCrm, validateEmail, identify, sendEvent};