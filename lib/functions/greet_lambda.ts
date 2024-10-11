const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://dhirendra:AlYgjyKAShbVQCwI@mongo-cluster-dev.xpakc.mongodb.net/?retryWrites=true&w=majority&appName=mongo-cluster-dev";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

exports.handler = async function () {
  await run();
  return {
    statusCode: 200,
    body: JSON.stringify('Hello world from Lambda - Step Function')
  }
}

async function run() {
  try {
    await client.connect();

    const database = client.db("sample_mflix");
    const collection = database.collection('comments');

    const searchQuery = { "name": "Jordan Medina" }
    const cursor = await collection.find(searchQuery).limit(10);
    await cursor.forEach((comment: { name: any; }) => {
      console.log(`${comment.name}`);
    });
  } catch (err) {
    console.error(`Something went wrong trying to find the documents: ${err}\n`);
  }
  finally {
    await client.close();
  }
}