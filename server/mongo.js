const {MongoClient} = require('mongodb');
var db_key = "mongodb+srv://thesis:s3eFAEHg9ENMr3Yp@koral-02ofn.mongodb.net/test?retryWrites=true&w=majority"; //special key for accessing my db
var client = new MongoClient(db_key, { useUnifiedTopology: true, useNewUrlParser: true }); //get instance of client

function mongo_init() {
    mongo.client.connect();
}




module.exports.mongo_init = mongo_init;
module.exports.listDatabases = listDatabases;
module.exports.listCollections = listCollections;

//Listing all the collections in a particular DB
async function listCollections(){

    const db = client.db("test1");
    const test = db.collection('test1');


    console.log("Cursor searching");
    const searchCursor = await test.find()
    const result = await searchCursor.toArray()
    console.log(result)
}

async function listDatabases(){
    console.log("DUPA")
    databasesList = await client.db().admin().listDatabases(); // you can look up everything in the obkject

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

//Function made when trying to put something into the DB
async function inserting(value){
    const db = client.db("test1");
    const test = db.collection('test1');
    var now = new Date()

//making an example object to put into the db
    const insertCursor = await test.insertOne(
        {
            Name: "Karol",
            Time: now.getHours() + ':' + now.getMinutes() +':' + now.getSeconds(),
            Temperature: value
        }
    )
}

async function send_to_database (value){
    console.log(value.x +"from send to db");

    const db = client.db("test1");
    const test = db.collection('test1');
    //var now = new Date()
    //var timestamp = date.getTime();

    //const collections = await db.collections();
    //collections.forEach(c=>console.log(c.collectionName));

    //const searchCursor = await test.find()
    //const result = await searchCursor.toArray()
    //console.table(result)


    const insertCursor = await test.insertOne(
        {
            //time: value.time,
            x_axis: value.x,
            y_axis: value.y,
            z_axis: value.z,
            //w_axis: value.w,
            target: value.t
            //Name: "KArol"
        }
    )

    return insertCursor;
}