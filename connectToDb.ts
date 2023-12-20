import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const mongodb_username = process.env.MONGODB_USERNAME as string;
const mongodb_password = process.env.MONGODB_PASSWORD as string; 
const mongodb_uri = `mongodb+srv://${mongodb_username}:${mongodb_password}@leaderboard.a004ccl.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(mongodb_uri);

async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB:", error);
    }
}

export const database = client.db("leaderboard");

export default connectToDB;
