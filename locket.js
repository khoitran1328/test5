const $ = new Env('LocketUnlocked');

function handleRevenueCat() {
    let body = $response.body;
    if (!body) return $done({});
    try {
        let obj = JSON.parse(body);
        
        // Mở khóa toàn bộ quyền lợi
        if (obj.subscriber) {
            obj.subscriber.entitlements = {
                "Gold": {
                    "expires_date": "2099-12-31T23:59:59Z",
                    "product_identifier": "locket_gold_lifetime",
                    "purchase_date": "2024-01-01T00:00:00Z"
                },
                "premium": {
                    "expires_date": "2099-12-31T23:59:59Z",
                    "product_identifier": "locket_premium",
                    "purchase_date": "2024-01-01T00:00:00Z"
                },
                "gold": {
                    "expires_date": "2099-12-31T23:59:59Z",
                    "product_identifier": "locket_gold_lifetime",
                    "purchase_date": "2024-01-01T00:00:00Z"
                }
            };
            
            // Giả lập các gói đăng ký
            obj.subscriber.subscriptions = {
                "locket_gold_lifetime": {
                    "billing_issues_detected_at": null,
                    "expires_date": "2099-12-31T23:59:59Z",
                    "is_sandbox": false,
                    "original_purchase_date": "2024-01-01T00:00:00Z",
                    "period_type": "normal",
                    "purchase_date": "2024-01-01T00:00:00Z",
                    "store": "app_store",
                    "unsubscribe_detected_at": null
                },
                "locket_gold_yearly": {
                    "billing_issues_detected_at": null,
                    "expires_date": "2099-12-31T23:59:59Z",
                    "is_sandbox": false,
                    "original_purchase_date": "2024-01-01T00:00:00Z",
                    "period_type": "normal",
                    "purchase_date": "2024-01-01T00:00:00Z",
                    "store": "app_store",
                    "unsubscribe_detected_at": null
                },
                "locket_gold_monthly": {
                    "billing_issues_detected_at": null,
                    "expires_date": "2099-12-31T23:59:59Z",
                    "is_sandbox": false,
                    "original_purchase_date": "2024-01-01T00:00:00Z",
                    "period_type": "normal",
                    "purchase_date": "2024-01-01T00:00:00Z",
                    "store": "app_store",
                    "unsubscribe_detected_at": null
                },
                "locket_premium": {
                    "billing_issues_detected_at": null,
                    "expires_date": "2099-12-31T23:59:59Z",
                    "is_sandbox": false,
                    "original_purchase_date": "2024-01-01T00:00:00Z",
                    "period_type": "normal",
                    "purchase_date": "2024-01-01T00:00:00Z",
                    "store": "app_store",
                    "unsubscribe_detected_at": null
                }
            };
            
            // Quan trọng: Thêm management_url và original_app_user_id
            obj.subscriber.original_app_user_id = "locket_user";
            obj.subscriber.management_url = "https://apps.apple.com/account/subscriptions";
        }
        
        // Mở khóa tất cả frames
        if (obj.frames) {
            obj.frames = obj.frames.map(f => ({ ...f, is_premium: false }));
        }
        
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
                const premiumKeys = [
                    'is_gold', 'is_premium', 'enable_filters', 'enable_gold_filters',
                    'enable_premium_filters', 'show_gold_frames', 'show_premium_frames',
                    'gold_subscription', 'gold_lifetime', 'premium_subscription',
                    'enable_locket_gold', 'enable_locket_premium', 'is_locket_gold',
                    'max_upload_video_duration', 'max_video_duration', 'max_video_upload_duration'
                ];
                if (premiumKeys.includes(entry.key)) {
                    entry.value = "true";
                }
                return entry;
            });
        }
        
        if (obj.config) {
            obj.config.enable_gold = true;
            obj.config.enable_premium = true;
            obj.config.enable_filters = true;
            obj.config.show_gold_frames = true;
            obj.config.show_premium_frames = true;
            obj.config.max_upload_video_duration = 60;
            obj.config.max_video_duration = 60;
        }
        
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
