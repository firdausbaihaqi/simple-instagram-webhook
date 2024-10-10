export const API_URL = "https://graph.instagram.com/v20.0/me/messages";
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const RECIPIENT_IDS = process.env.RECIPIENT_IDS ? process.env.RECIPIENT_IDS.split(',') : [];

export const getRandomRecipientId = () => RECIPIENT_IDS[Math.floor(Math.random() * RECIPIENT_IDS.length)];

export const colors = {
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
};

export const attachmentUrls = {
    image: "https://file-examples.com/storage/fea570b16e6703ef79e65b4/2017/10/file_example_PNG_500kB.png",
    audio: "https://file-examples.com/storage/fea570b16e6703ef79e65b4/2017/11/file_example_MP3_700KB.mp3",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
};