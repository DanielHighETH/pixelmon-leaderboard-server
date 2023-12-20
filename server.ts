import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cron from 'node-cron';
import connectToDB, {database} from './connectToDb';

dotenv.config();

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

        // Extracting data from response
        const relicsResponse = response.data.result.response.relicsResponse;
        const totalCount = response.data.result.totalCount;
        const imageUrl = response.data.result.response.metadata.imageUrl;
        const name = response.data.result.response.metadata.name;
        const tribe = response.data.result.response.metadata.tribe;
        const rarity = response.data.result.response.metadata.rarity;
        let evolution = null;
        if(nftType === 'pixelmon') {
            evolution = response.data.result.response.metadata.evolution;
        }

        if (totalCount === 0 || totalCount === null) {
            console.log(`No data for ${nftType} with ID ${tokenId}`);
            return null;
        }

        // Updating or inserting data in MongoDB
        const collection = database.collection(nftType);
        const updateResult = await collection.updateOne(
            { nftType, tokenId }, 
            { $set: { relicsResponse, totalCount, imageUrl, name, tribe, rarity, evolution } }, 
            { upsert: true }
        );

        if (updateResult.upsertedCount > 0) {
            console.log(`Inserted new data for ${nftType} with ID ${tokenId}`);
        } else if (updateResult.modifiedCount > 0) {
            console.log(`Updated existing data for ${nftType} with ID ${tokenId}`);
        } else {
            console.log(`No changes for ${nftType} with ID ${tokenId}`);
        }

        return { relicsResponse, totalCount, imageUrl, name, tribe, rarity, evolution };
    } catch (error) {
        console.error(`Error downloading data for ${nftType} with ID ${tokenId}:`, error);
        return null;
    }
}

async function downloadForType(nftType: string, maxId: number) {
    for (let i = 0; i <= maxId; i++) {
        console.log(`Downloading ${nftType} with ID ${i}`);
        await downloadData(nftType, i);

        // Every 100 downloads, wait for 20 seconds
        if (i % 100 === 0 && i !== 0) {
            console.log(`Waiting 20 seconds after ${i} downloads...`);
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
    }
}

cron.schedule('0 0 * * *', () => {
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
