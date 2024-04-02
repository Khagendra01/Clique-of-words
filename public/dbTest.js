require("dotenv").config();
console.log(process.env.DB_FULL_URL); // This should print your connection string

const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.DB_FULL_URL; // Directly use the full URL from the environment
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const database = client.db("logininfo"); // Name of the database
    const collection = database.collection("users"); // Name of the collection
    
    // Fetching a single document as a test
    const document = await collection.findOne({});
    console.log(document ? document : "No document found");
    
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
