import { MongoClient } from 'mongodb';


const mongo_uri = 'mongodb+srv://danielhigheth:<password>@leaderboard.a004ccl.mongodb.net/?retryWrites=true&w=majority'

const uri = "mongodb+srv://danielhigheth:<password>@leaderboard.a004ccl.mongodb.net/?retryWrites=true&w=majority"; // Replace with your MongoDB URI
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB:", error);
    }
}

export const database = client.db("yourDatabaseName"); // Replace with your database name

export default connectDB;
