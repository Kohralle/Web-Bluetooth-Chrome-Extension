const mongo = require('./mongo.js');
console.log("got it")
var express = require('express');  //I am using express for starting the server and utilizing middleware
var app = express();
app.listen(8080);
main();


app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'index.html')); // Fire up my html client side page to view at http://localhost:8080 with get request
});


//app.use('/', express.static(public)); //serve the page statically

app.use(express.json({limit:'1mb'})); //this is for converting the put request into a json file, the filter doesnt have any use


//This is simple function for seeing all the databases in my MongoDB account






//function called when the local server starts up to initiate the connectien with the database
async function main(){

    try {
        // Connect to the MongoDB cluster
        //mongo.mongo_init();

        await mongo.mongo_init;
        console.log("Connected!");
        await mongo.listDatabases;
        //await inserting();
        await mongo.listCollections;
    } catch (e) {
        console.error(e);
        //console.log('yo');
    } finally {
        //await client.close(); //Need to read up on connecting and closing the database, because I am not sure if finally should be here
    }
}

//main().catch(console.error);



app.post('/handle', async function (request, response) {

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

app.get('/getdata', async function (request, response) {
    //we have to give him the database array
    const db = client.db("test1");
    const test = db.collection('test1');

    //const collections = await db.collections();
    //collections.forEach(c=>console.log(c.collectionName));
    console.log("Cursor searching");
    const searchCursor = await test.find()
    const result = await searchCursor.toArray()
    //console.log(result[0]);
    const haha = JSON.stringify(result)

    var fs = require('fs');
    fs.writeFile("test.txt", haha, function(err) {
    if (err) {
        console.log(err);
    }
});
    console.log(haha);
    response.json({
        status: "success",
        payload: haha
    })
    //console.log(response);
    //response.send();
});

//middleware testing
/*
app.get('/test', (req, res) => {
    res.send('We are on homeee');
    console.log("req.body")
});
*/
