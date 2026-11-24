const $ = new Env('LocketUnlocked');

function handleRevenueCat() {
    let body = $response.body;
    if (!body) return $done({});
    try {
        let obj = JSON.parse(body);
        if (obj.subscriber) {
            obj.subscriber.entitlements = {
                "Gold": { "expires_date": "2099-12-31T23:59:59Z", "product_identifier": "locket_gold_lifetime", "purchase_date": "2024-01-01T00:00:00Z" },
                "premium": { "expires_date": "2099-12-31T23:59:59Z", "product_identifier": "locket_premium", "purchase_date": "2024-01-01T00:00:00Z" }
            };
            obj.subscriber.subscriptions = {
                "locket_gold_lifetime": { "billing_issues_detected_at": null, "expires_date": "2099-12-31T23:59:59Z", "is_sandbox": false, "original_purchase_date": "2024-01-01T00:00:00Z", "period_type": "normal", "purchase_date": "2024-01-01T00:00:00Z", "store": "app_store", "unsubscribe_detected_at": null }
            };
        }
        if (obj.frames) { obj.frames = obj.frames.map(f => ({ ...f, is_premium: false })); }
        $done({ body: JSON.stringify(obj) });
    } catch (e) { $done({}); }
}

function handleFirebaseConfig() {
    let body = $response.body;
    if (!body) return $done({});
    try {
        let obj = JSON.parse(body);
        if (obj.entries) {
            obj.entries = obj.entries.map(entry => {
                if (entry.key === "is_gold" || entry.key === "is_premium" || entry.key === "enable_filters") { entry.value = "true"; }
                return entry;
            });
        }
        if (obj.config) { obj.config.enable_gold = true; obj.config.enable_premium = true; obj.config.enable_filters = true; }
        $done({ body: JSON.stringify(obj) });
    } catch (e) { $done({}); }
}

function handleYouTube() {
    let body = $response.body;
    if (!body) return $done({});
    const captionLang = "vi";
    const blockShorts = true;
    try {
        let obj = JSON.parse(body);
        if (captionLang !== "off" && obj.captions) {
            obj.captions.playerCaptionsTracklistRenderer.captionTracks.forEach(track => { track.languageCode = captionLang; });
        }
        if (blockShorts && obj.contents) {
            const contents = obj.contents.singleColumnBrowseResultsRenderer?.tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
            obj.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents = contents.filter(c => !JSON.stringify(c).includes("Shorts"));
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) { $done({}); }
}

function handleSpotify() {
    let body = $response.body;
    if (!body) return $done({});
    if ($request.url.includes("artistview") || $request.url.includes("album-entity-view")) {
        try {
            let obj = JSON.parse(body);
            if (obj.data) {
                if (obj.data.artistUnion) { obj.data.artistUnion.profile.isPremium = true; }
                if (obj.data.albumUnion) { obj.data.albumUnion.isPremium = true; }
            }
            $done({ body: JSON.stringify(obj) });
        } catch (e) { $done({}); }
    } else { $done({ body: body }); }
}

if ($request.url.includes("api.revenuecat.com")) { handleRevenueCat(); }
else if ($request.url.includes("firebaseremoteconfig.googleapis.com")) { handleFirebaseConfig(); }
else if ($request.url.includes("youtubei.googleapis.com")) { handleYouTube(); }
else if ($request.url.includes("spotify.com")) { handleSpotify(); }
else { $done({}); }

function Env(name) { return { name: name, log: (msg) => console.log(`[${name}] ${msg}`), done: (obj) => $done(obj) }; }