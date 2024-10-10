import { serve } from "bun";
import readline from 'node:readline';

const APP_ID = process.env.APP_ID
const APP_SECRET = process.env.APP_SECRET
const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET
const APP_URL = process.env.APP_URL
const REDIRECT_URI = `${APP_URL}/instagram-callback`;

const server = serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "GET" && url.pathname === "/webhook") {
            return handleWebhookVerification(url);
        }

        if (req.method === "GET" && url.pathname === "/instagram-callback") {
            const { searchParams } = url;
            const responseData: Record<string, string> = {};

            for (const [key, value] of searchParams.entries()) {
                responseData[key] = value;
            }

            console.log("Instagram callback received:", responseData);

            return new Response(JSON.stringify(responseData, null, 2), {
                headers: { "Content-Type": "application/json" },
            });
        }

        if (req.method === "POST" && url.pathname === "/deauthorize") {
            return handleDeauthorize(req);
        }

        if (req.method === "POST" && url.pathname === "/data-deletion-request") {
            return handleDataDeletionRequest(req);
        }

        if (req.method === "GET" && url.pathname === "/get-access-token") {
            return handleGetAccessToken(url);
        }

        if (req.method === "GET" && url.pathname === "/get-long-lived-access-token") {
            return handleGetLongLivedAccessToken(url);
        }

        if (req.method === "POST" && url.pathname === "/webhook") {
            return handleWebhookEvent(req);
        }

        return new Response("Not Found", { status: 404 });
    },
});

function handleWebhookVerification(url: URL) {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        return new Response(challenge);
    }

    return new Response("Forbidden", { status: 403 });
}

async function handleWebhookEvent(req: Request) {
    const body: {
        object: string;
        entry: Array<{
            time: number;
            id: string;
            messaging: Array<{
                sender: { id: string };
                recipient: { id: string };
                timestamp: number;
                message: {
                    mid: string;
                    text: string;
                };
            }>;
            changes?: any[] | any
        }>;
    } = await req.json();

    // TODO: comment the next logger if you want to only log messages related events
    console.log("Received webhook payload:");
    console.log(JSON.stringify(body, null, 2));
    console.log('----------------------------------------------------------')


    if (Array.isArray(body.entry)) {
        for (const entry of body.entry) {
            if (entry.changes) {
                for (const change of entry.changes) {
                    console.log(`Received ${change.field} update:`);
                    console.log(JSON.stringify(change.value, null, 2));
                }
            } else if (entry.messaging) {
                for (const message of entry.messaging) {
                    // console.log("Received message:");
                    // console.log(JSON.stringify(message, null, 2));
                    // console.log('----------------------------------------------------------')
                }
            } else {
                console.log("Unhandled entry type:");
                console.log(JSON.stringify(entry, null, 2));
            }
        }
    } else {
        console.log("Unexpected payload structure");
    }

    return new Response("OK");
}
async function handleGetAccessToken(url: URL) {
    const authorizationCode = url.searchParams.get("code");

    if (!authorizationCode) {
        return new Response("Missing authorization code", { status: 400 });
    }

    const accessTokenUrl = "https://api.instagram.com/oauth/access_token";
    const formData = new FormData();
    formData.append("client_id", INSTAGRAM_APP_ID || '');
    formData.append("client_secret", INSTAGRAM_APP_SECRET || '');
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", REDIRECT_URI);
    formData.append("code", authorizationCode);

    try {
        const response = await fetch(accessTokenUrl, {
            method: "POST",
            body: formData
        });
        const data = await response.json();

        console.log("Access token response:", JSON.stringify(data, null, 2));

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching access token:", error);
        return new Response("Error fetching access token", { status: 500 });
    }
}

async function handleGetLongLivedAccessToken(url: URL) {
    const authorizationCode = url.searchParams.get("access_token");
    if (!authorizationCode) {
        return new Response("Missing access token", { status: 400 });
    }

    const longLivedTokenUrl = new URL("https://graph.instagram.com/access_token");
    longLivedTokenUrl.searchParams.append("grant_type", "ig_exchange_token");
    longLivedTokenUrl.searchParams.append("client_secret", INSTAGRAM_APP_SECRET || '');
    longLivedTokenUrl.searchParams.append("access_token", authorizationCode);

    try {
        const response = await fetch(longLivedTokenUrl.toString(), { method: "GET" });
        const data = await response.json();

        console.log("Long-lived access token response:", JSON.stringify(data, null, 2));

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching long-lived access token:", error);
        return new Response("Error fetching long-lived access token", { status: 500 });
    }
}

async function handleDeauthorize(req: Request) {
    const body = await req.json();
    console.log("Deauthorization callback received:", body);
    // TODO: Implement deauthorization logic here later
    return new Response("Deauthorization processed", { status: 200 });
}

async function handleDataDeletionRequest(req: Request) {
    const body = await req.json();
    console.log("Data deletion request received:", body);
    // TODO: Implement data deletion logic here
    return new Response("Data deletion request processed", { status: 200 });
}

console.log(`Webhook server listening on port ${server.port}`);

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
    // Ctrl+C, exit the process
    if (key.name === 'c' && key.ctrl) {
        process.exit();
    }
    // 'l' key, clear the console
    else if (key.name === 'l') {
        console.clear();
        console.log(`Webhook server listening on port ${server.port}`);
        console.log("Press 'l' to clear the console");
    }
});

console.log("Press 'l' to clear the console");
