// AutoSubs Cavalry Bridge Server
var PORT = 8186;
var server = new api.WebServer();
server.listen("127.0.0.1", PORT);
console.log("AutoSubs Cavalry Bridge listening on port " + PORT);

// Polling interval loop to check for requests without blocking the Cavalry UI thread
function pollServer() {
    var post = server.getNextPost();
    if (post) {
        try {
            var data = JSON.parse(post.body());
            if (data.type === "status") {
                // Return handshake status
                post.respond(200, "application/json", '{"status":"connected"}');
            } else if (data.type === "subtitles") {
                // Process subtitles list
                var subs = data.subtitles;
                importSubtitles(subs);
                post.respond(200, "application/json", '{"status":"success"}');
            } else {
                post.respond(400, "application/json", '{"error":"unknown request type"}');
            }
        } catch (e) {
            post.respond(500, "application/json", '{"error":"' + e.toString() + '"}');
        }
    }
    // Schedule next poll check
    api.setTimeout(pollServer, 100);
}

function importSubtitles(subs) {
    if (!subs || subs.length === 0) {
        console.log("No subtitles received.");
        return;
    }
    
    // Create layers or String Array to hold subtitles data
    var textArrayId = api.create("stringArray", "AutoSubs_Text");
    var startArrayId = api.create("valueArray", "AutoSubs_StartSeconds");
    var endArrayId = api.create("valueArray", "AutoSubs_EndSeconds");

    for (var i = 0; i < subs.length; i++) {
        api.addArrayIndex(textArrayId, "array");
        api.addArrayIndex(startArrayId, "array");
        api.addArrayIndex(endArrayId, "array");

        var textKey = "array." + i;
        var valKey = "array." + i;
        
        var payload = {};
        payload[textKey] = subs[i].text;
        api.set(textArrayId, payload);

        var startPayload = {};
        startPayload[valKey] = subs[i].start;
        api.set(startArrayId, startPayload);

        var endPayload = {};
        endPayload[valKey] = subs[i].end;
        api.set(endArrayId, endPayload);
    }
    console.log("Successfully imported " + subs.length + " subtitles from AutoSubs.");
}

pollServer();
