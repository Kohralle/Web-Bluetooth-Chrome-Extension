const {MongoClient} = require('mongodb');
var db_key = "mongodb+srv://thesis:s3eFAEHg9ENMr3Yp@koral-02ofn.mongodb.net/test?retryWrites=true&w=majority"; //special key for accessing my db
var client = new MongoClient(db_key, { useUnifiedTopology: true, useNewUrlParser: true }); //get instance of client

var express = require('express');  //I am using express for starting the server and utilizing middleware
var app = express();
app.listen(8080);
main();

var ml = require('./ml.js');
var predict = require('./predict.js')
var state = 0; //signifies the state for collection

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
    console.log("Cursor searching");
    const searchCursor = await test.find()
    const result = await searchCursor.toArray()
    console.log(result)
    return result

}

async function clear_database(){
const db = client.db("test1");
const test = db.collection('test1');
test.deleteMany({});
}


//function called when the local server starts up to initiate the connection with the database
async function main(){

    try {
        // Connect to the MongoDB cluster

        await client.connect();

        await listDatabases();

        await listCollections();

    } catch (e) {
        console.error(e);
    }
}


async function send_to_database (value){
    //to console log do value.x

    const db = client.db("test1");
    const test = db.collection('test1');

    const insertCursor = await test.insertOne(
        {
            x_axis: value.x,
            y_axis: value.y,
            z_axis: value.z,
            target: state
        }
    )
}

var array = []
app.post('/store_values', async function (request, response) {

    //console.log(request.body.value);
    //I implemented a queue for incoming values so that they do not overwrite as they come in quite quick
    //and I would get overflow errors with higher thingy frequencies
    console.log(request.body);
    array.push(request.body)
    let req =  array.pop()
    await send_to_database(req) //pass the value to send to the database, await it so that it doesnt execute further until a value is returned

    response.json({
        status: "success"
    });
});

app.post('/predict', async function (request, response) {
    console.log(request.body);
    let state = await predict.prediction(request.body);
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

    ml.learn(result);

    setInterval(function(){
    response.write(JSON.stringify(ml.loss_function()))}, 1000);

});

app.get('/learning_progress_status', async function (request, response) {
    let finished = false
    console.log(ml.loss_function())
    let variable = ml.loss_function();
    if(global.training_finished == true){
        finished = true
        variable.finished = true
    }
    let send = JSON.stringify(variable)
    response.type('json')
    response.send(send)
});

app.post('/set_state', async function (request, response) {
    state = request.body.state
    response.send("Got it");
});

app.get('/pull_database', async function (request, response) {
    let message = await listCollections();
    response.send(message);
});

app.get('/reset_database', async function (request, response) {
    console.log("Got request")
    await clear_database();
    response.send(true);
});

app.get('/load_pretrained_model', async function (request, response) {
    ml.load_model();
    response.set('Content-Type', 'text/plain');
    response.send("The model has loaded");
});