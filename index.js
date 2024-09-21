const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv=require('dotenv').config();


const uri=process.env.REACT_APP_URI;

const app = express();

app.use(cors());
app.use(bodyParser.json());


 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const findfunc = async (mail) => {
  await client.connect();
  try {

    const collection = await client.db("notes").collection("notes");

    const query = { mail: `${mail}` };

    const cursor = await collection.find(query);
    const notes = await cursor.toArray(); // Convert cursor to array
    // console.log(notes);
    return (notes);
  } catch (error) {
    console.log(error);
    return [];
  }
}

const insertfun = async (user) => {
  await client.connect();
  try {

    const collection = await client.db("notes").collection("notes");

    await collection.insertOne(user);
    // console.log(user);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deletefun(documentId) {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Get the database and collection

    const collection = await client.db("notes").collection("notes");
    // Delete the document
    const result = await collection.deleteOne({ _id: new ObjectId(documentId) });

    if (result.deletedCount === 1) {
      console.log(`Successfully deleted document with _id: ${documentId}`);
    } else {
      console.log(`No document found with _id: ${documentId}`);
    }

  } catch (err) {
    console.error('An error occurred:', err);
  }
}

client.connect();


app.get('/notes/:mail', async (req, res) => {
  const mail = req.params.mail;
  const result = await findfunc(mail);
  res.send(result);
})

app.post('/submit', async (req, res) => {
  const result = await insertfun(req.body);
  res.send(result);
})

app.delete('/delete', async (req, res) => {
  const result = await deletefun(req.body._id);
  // console.log(req.body._id);
  
  res.send(true);
})

app.listen(5000);