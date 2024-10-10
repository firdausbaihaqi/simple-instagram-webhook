import { API_URL, ACCESS_TOKEN, getRandomRecipientId, attachmentUrls } from './config';

interface SendMessageResult {
    success: boolean;
    error?: string;
}

async function sendRequest(body: object): Promise<SendMessageResult> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export async function sendTextMessage(text: string): Promise<SendMessageResult> {
    return sendRequest({
        recipient: { id: getRandomRecipientId() },
        message: { text },
    });
}

export async function sendImageMessage(): Promise<SendMessageResult> {
    return sendRequest({
        recipient: { id: getRandomRecipientId() },
        message: {
            attachment: {
                type: "image",
                payload: { url: attachmentUrls.image },
            },
        },
    });
}

export async function sendAudioMessage(): Promise<SendMessageResult> {
    return sendRequest({
        recipient: { id: getRandomRecipientId() },
        message: {
            attachment: {
                type: "audio",
                payload: { url: attachmentUrls.audio },
            },
        },
    });
}

export async function sendVideoMessage(): Promise<SendMessageResult> {
    return sendRequest({
        recipient: { id: getRandomRecipientId() },
        message: {
            attachment: {
                type: "video",
                payload: { url: attachmentUrls.video },
            },
        },
    });
}

export async function sendStickerMessage(): Promise<SendMessageResult> {
    return sendRequest({
        recipient: { id: getRandomRecipientId() },
        message: {
            attachment: {
                type: "like_heart",
            },
        },
    });
}