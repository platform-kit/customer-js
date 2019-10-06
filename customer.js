function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// detect which services on page
var detectedServices = [];
if (gist !== undefined) {
    detectedServices.push('gist');
}
if (window.intercomSettings !== undefined) {
    detectedServices.push('intercom');
}
if (drift !== undefined) {
    detectedServices.push('drift');
}
if (mixpanel !== undefined) {
    detectedServices.push('mixpanel');
}


/**
 * Identify the user on registered services
 * @param {string} identifier - Identifier assumed to always be emailId for now
 * @param {object} [data]
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

    var result = {};
    var input = {identifier: data}
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
}
