import express from 'express';
import axios from 'axios';
import cron from 'node-cron';

const app = express();
const port = 3000;

async function downloadData(nftType: string, tokenId: number) {
    const url = 'https://api-cp.pixelmon.ai/nft/get-relics-count';
    try {
        const response = await axios.post(url, {
            nftType: nftType,
            tokenId: tokenId
        });
        // Process your data here
        // For example, save it to a file
        return response.data;
    } catch (error) {
        console.error(`Error downloading data for ${nftType} with ID ${tokenId}:`, error);
        return null;
    }
}

async function downloadForType(nftType: string, maxId: number) {
    for (let i = 0; i <= maxId; i++) {
        console.log(`Downloading ${nftType} with ID ${i}`);
        await downloadData(nftType, i);
        // Consider adding a delay here if needed
    }
}

cron.schedule('0 */3 * * *', () => {
    console.log('Running cron job for pixelmon');
    downloadForType('pixelmon', 12101);

    console.log('Running cron job for trainer');
    downloadForType('trainer', 10020);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
