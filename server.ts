import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cron from 'node-cron';
import connectToDB, {database} from './connectToDb';

const app = express();
const port = 3000;

const pixelmonMaxId = process.env.PIXELMON_MAX || 12101;
const trainerMaxId = process.env.TRAINER_MAX || 10020;

connectToDB();

async function downloadData(nftType: string, tokenId: number) {
    const url = 'https://api-cp.pixelmon.ai/nft/get-relics-count';
    try {
        const response = await axios.post(url, {
            nftType: nftType,
            tokenId: tokenId
        });

        // Extracting relicsResponse and totalCount
        const relicsResponse = response.data.result.response.relicsResponse;
        const totalCount = response.data.result.totalCount;

        if(totalCount === 0 || totalCount === null) {
            console.log(`No data for ${nftType} with ID ${tokenId}`);
            return null;
        }

        // Saving to MongoDB
        const collection = database.collection(nftType);
        await collection.insertOne({ nftType, tokenId, relicsResponse, totalCount });

        return { relicsResponse, totalCount };
    } catch (error) {
        console.error(`Error downloading data for ${nftType} with ID ${tokenId}:`, error);
        return null;
    }
}


async function downloadForType(nftType: string, maxId: number) {
    for (let i = 0; i <= maxId; i++) {
        console.log(`Downloading ${nftType} with ID ${i}`);
        await downloadData(nftType, i);
    }
}

cron.schedule('0 0,12 * * *', () => {
    console.log('Running cron job for pixelmon');
    downloadForType('pixelmon', pixelmonMaxId as number);

    console.log('Running cron job for trainer');
    downloadForType('trainer', trainerMaxId as number);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    console.log('Initiating download for pixelmon');
    downloadForType('pixelmon', pixelmonMaxId as number);

    console.log('Initiating download for trainer');
    downloadForType('trainer', trainerMaxId as number);
});
