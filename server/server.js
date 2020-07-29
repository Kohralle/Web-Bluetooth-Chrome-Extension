const {MongoClient} = require('mongodb');
var db_key = "mongodb+srv://thesis:s3eFAEHg9ENMr3Yp@koral-02ofn.mongodb.net/test?retryWrites=true&w=majority"; //special key for accessing my db
var client = new MongoClient(db_key, { useUnifiedTopology: true, useNewUrlParser: true }); //get instance of client

var express = require('express');  //I am using express for starting the server and utilizing middleware
var app = express();
app.listen(8080);
main();

var ml = require('./ml.js');



app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html')); // Fire up my html client side page to view at http://localhost:8080 with get request
});

app.use(express.json({limit:'1mb'})); //this is for converting the put request into a json file, the filter doesnt have any use


//This is simple function for seeing all the databases in my MongoDB account
async function listDatabases(){
    databasesList = await client.db().admin().listDatabases(); // you can look up everything in the obkject

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

//Listing all the collections in a particular DB
async function listCollections(){

    const db = client.db("test1");
    const test = db.collection('test1');

    //const collections = await db.collections();
    //collections.forEach(c=>console.log(c.collectionName));
    console.log("Cursor searching");
    const searchCursor = await test.find()
    const result = await searchCursor.toArray()
    console.log(result)
    return result

}

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

async function clear_database(){
const db = client.db("test1");
const test = db.collection('test1');


// Delete All documents from collection Using blank BasicDBObject
test.deleteMany({});
//test.remove({})
}


//function called when the local server starts up to initiate the connectien with the database
async function main(){

    try {
        // Connect to the MongoDB cluster

        await client.connect();

        await listDatabases();

        await listCollections();

        //await clear_database();
    } catch (e) {
        console.error(e);
    } finally {
        //await client.close(); //Need to read up on connecting and closing the database, because I am not sure if finally should be here
    }
}

//main().catch(console.error);

async function send_to_database (value){
    console.log(value.x +"from send to db");

    const db = client.db("test1");
    const test = db.collection('test1');

    const insertCursor = await test.insertOne(
        {
            //time: value.time,
            x_axis: value.x,
            y_axis: value.y,
            z_axis: value.z,
            //w_axis: value.w,
            target: state
            //Name: "KArol"
        }
    )

    return insertCursor;
}

var array = []
app.post('/store_values', async function (request, response) {

    //console.log(request.body.value);
    //I implemented a queue for incoming values so that they do not overwrite as they come in quite quick
    console.log(request.body);
    array.push(request.body)
    let req =  array.pop()
    //console.log(req.x.toString() +' req variable');
    let data = await send_to_database(req) //pass the value to send to the database, await it so that it doesnt execute further until a value is returned



    //console.log("A");
    //console.log(data + "This is the object");

    //send back a response, When I log it out in chrome it returns as an unresolved promise, have to work on handling this asynchronously
    response.json({
        status: "success"
    });
});

var ml = require('./ml.js');
var predict = require('./predict.js')

app.post('/predict', async function (request, response) {
    console.log(request.body);
    let state = await predict.prediction(request.body, ml.modelle);
    console.log(state);
    response.send(JSON.stringify(state));
});

app.get('/train', async function (request, response) {
    console.log("GOT THE REQUEST");
    const db = client.db("test_subjects");
    const test = db.collection('pawel');


    console.log("Cursor searching");
    const searchCursor = await test.find()
    const result = await searchCursor.toArray()
    console.log(typeof result)
    console.log("THIS DA RESULT")
    //console.log(result)
    console.log("YO GURT")
    console.log(Object.values(result));
    console.log(typeof Object.values(result));
    const haha = JSON.stringify(result)
    console.log(typeof haha)
    ml.learn(result);

    var fs = require('fs');
    fs.writeFile("test.txt", haha, function(err) {
    if (err) {
        console.log(err);
    }
});
    //console.log(haha);
    response.json({
        status: "success",
        payload: haha
    })

});

app.get('/learning_progress_status', async function (request, response) {
    let finished = false

    if(global.training_finished == true){
        finished = true
    }


    response.send(finished);
});
var state = 0;
app.post('/set_state', async function (request, response) {
    console.log(request.body.state)
    state = request.body.state
    response.send("YUH");
});

app.get('/pull_database', async function (request, response) {
    let message = await listCollections();
    response.send(message);
});

app.get('/reset_database', async function (request, response) {
    console.log("Got request")
    await clear_database();
    console.log("NOTHA")
    let message = {reset: true}
    response.send(true);
});





