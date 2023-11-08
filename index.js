const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yyjzvb3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("DreamJobs");
    const allJobsCollection = database.collection("allJobs");
    const appliedJobsCollection = database.collection("appliedJobs");

    app.get('/alljobs', async (req, res) => {
      console.log(req.query);

      let query = {};
      if (req.query?.addedBy){
        query = { addedBy: req.query.addedBy};
      }

      if(req.query?.addedBy && req.query?.id){
        query = { _id: new ObjectId(req.query.id)};
      }

      const result = await allJobsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/alljobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const job = await allJobsCollection.findOne(query);
      res.send(job);
    });

    app.get('/appliedJobs', async (req, res) => {
      console.log(req.query.applicantEmail);
      let query = {};
      if (req.query?.applicantEmail){
        query = { applicantEmail: req.query.applicantEmail};
      }
      const result = await appliedJobsCollection.find(query).toArray();
      res.send(result);
    });

    app.post('/alljobs', async (req, res) => {
      const job = req.body;
      console.log(job);
      const result = await allJobsCollection.insertOne(job);
      res.send(result);
    });

    app.post('/appliedJobs', async (req, res) => {
      const jobWithApplicant = req.body;
      console.log(jobWithApplicant);
      const result = await appliedJobsCollection.insertOne(jobWithApplicant);
      res.send(result);
    });

    app.put('/alljobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedInformation = req.body;
      const information = {
        $set: {
          jobBanner: updatedInformation.jobBanner,
          jobTitle: updatedInformation.jobTitle,
          authorName: updatedInformation.authorName,
          authorEmail: updatedInformation.authorEmail,
          category: updatedInformation.category,
          shortDescription: updatedInformation.shortDescription,
          salaryRange: updatedInformation.salaryRange,
          postingDate: updatedInformation.postingDate,
          deadline: updatedInformation.deadline,
          appliedNumber: updatedInformation.appliedNumber,
          addedBy: updatedInformation.addedBy
        }
      }

      const result = await allJobsCollection.updateOne(query, information, options);
      res.send(result);

    });


    app.delete('/alljobs', async (req, res) => {
      console.log(req.query);

      if(req.query?.addedBy && req.query?.id){
        query = { _id: new ObjectId(req.query.id)};
      }
      const result = await allJobsCollection.deleteOne(query);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('DreamJobs server is working perfectly');
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})