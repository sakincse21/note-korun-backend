const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv = require('dotenv').config();
const admin = require('firebase-admin');


const uri = process.env.REACT_APP_URI;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// var serviceAccount = require(process.env.REACT_APP_PATH);
const { getAuth } = require("firebase-admin/auth");


admin.initializeApp({
  credential: admin.credential.cert({
    "type": `${process.env.REACT_APP_type}`,
    "project_id": `${process.env.REACT_APP_project_id}`,
    "private_key_id": `${process.env.REACT_APP_private_key_id}`,
    "private_key": `${process.env.REACT_APP_private_key}`,
    "client_email": `${process.env.REACT_APP_client_mail}`,
    "client_id": `${process.env.REACT_APP_client_id}`,
    "auth_uri": `${process.env.REACT_APP_auth_uri}`,
    "token_uri": `${process.env.REACT_APP_token_uri}`,
    "auth_provider_x509_cert_url": `${process.env.REACT_APP_auth_provider_x509_cert_url}`,
    "client_x509_cert_url": `${process.env.REACT_APP_client_x509_cert_url}`,
    "universe_domain": `${process.env.REACT_APP_universe_domain}`
  })
});





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

    const collection = client.db("notes").collection("notes");

    const query = { mail: `${mail}` };

    const cursor = collection.find(query);
    const notes = await cursor.toArray(); // Convert cursor to array
    // console.log(notes);
    return (notes);
  } catch (error) {
    console.log(error);
    return [];
    //logs error and sends a empty array
  }
}

const insertfun = async (user) => {
  await client.connect();
  try {

    const collection = client.db("notes").collection("notes");

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

    const collection = client.db("notes").collection("notes");
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


app.get('/notes', async (req, res) => {
  const bearer = req.headers.authorization;
  // console.log(bearer);

  if (bearer && bearer.startsWith('Bearer')) {
    const idToken = bearer.slice(7);
    // console.log(idToken);

    //const idToken = tokensplit[1];
    // console.log(idToken);
    // idToken comes from the client app
    await getAuth()
      .verifyIdToken(idToken)
      .then(async (decodedToken) => {
        const email = decodedToken.email;
        // const mail = req.params.mail;
        //console.log(mail," ",email);
        // console.log(email);

        const result = await findfunc(email);
        // console.log(result);

        res.send(result);
        // console.log(result);
        // if (mail === email) {
        //   const result = await findfunc(mail);
        //   res.send(result);
        //   console.log(result);

        // }
        // ...
      })
      .catch((error) => {
        res.send(false);
      });
  }
})

app.post('/submit', async (req, res) => {
  const result = await insertfun(req.body);
  res.send(result);
})

app.delete('/delete', async (req, res) => {
  const result = await deletefun(req.body._id);
  res.send(true);
})

app.listen(5000);