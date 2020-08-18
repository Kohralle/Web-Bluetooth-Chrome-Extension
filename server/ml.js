const tf =  require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

global.model;
global.training_finished =  false;

global.send_epoch = 0;
global.send_loss = 0;
var express = require('express');  //I am using express for starting the server and utilizing middleware
var app = express();

function set_model(m) {
    global.model = m;
}
module.exports
module.exports.loss_function = function (data) {
    let object = {epoch: send_epoch, loss: send_loss, num_epoch: 200}
    return object;
}

module.exports.load_model = async function () {
    global.model = await tf.loadLayersModel('file://./model/model.json');
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function getColumn(anArray, columnNumber) {
    return anArray.map(function(row) {
        return row[columnNumber];
    });
}

function normalize(min, max){
    var delta = max - min;
    return function (val) {
        return (val - min) / delta;
    };
}

module.exports.learn = async function (data) {
    training_finished = false;
    let parsed_array = await convert_to_array(data)
    let array_no_id = parsed_array[0]
    let number_of_classes = parsed_array[1]

    const [xTrain, yTrain, xTest, yTest] = getData(0.2, array_no_id, number_of_classes)
    //get parse the data into 4 tensors for training

    model = await trainModel(xTrain, yTrain, xTest, yTest);

    const xData = xTest.dataSync();
    const yTrue = yTest.argMax(-1).dataSync();

    const predictions = await model.predict(xTest);

    const yPred = predictions.argMax(-1).dataSync();

    var correct = 0;
    var wrong = 0;
    for(var i=0; i<yTrue.length; i++){
        if(yTrue[i] == yPred[i]){
            correct++;
        } else {
            wrong++;
        }

    }
    console.log("Prediction error rate:" + (wrong / yTrue.length));
    console.log(wrong)
    console.log(correct)
    global.model.summary()

    //console.log(global.model);
    //console.log("SONE");
}

function convertToTensors(data, targets, testsplit){
    const numExamples = data.length;
    if (data.length !== targets.length) {
        throw new Error('data and split have different numbers of examples');
    }
    //taking the parsed data and converting it into tensors with tensor flow functions
    var data_tensor = tf.tensor3d(data)

    var sample_count = data_tensor.shape[0]
    var time_step = data_tensor.shape[1]
    var feature_count = data_tensor.shape[2]
    var test_split_shape = time_step * feature_count

    console.log(data_tensor.shape[0])
    console.log("reshaped data")
    var data_reshaped = data_tensor.reshape([sample_count, test_split_shape])

    const numTestExamples = Math.round(numExamples * testsplit);
    const numTrainExamples = numExamples - numTestExamples;
    console.log("Train examples:" + numTrainExamples);
    const xDims = data_reshaped.shape[1] //retrive the new shape for splitting the data

    // Create a 1D 'tf.Tensor' to hold the labels, and convert the number label
    // from the set {0, 1, 2} into one-hot encoding (.e.g., 0 --> [1, 0, 0]).

    const encoded_targets = tf.oneHot(tf.tensor1d(targets).toInt(), 3);

    // Split the data into training and test sets, using 'slice'.
    console.log("XTRAIN");
    const xTrain_flat = data_reshaped.slice([0, 0], [numTrainExamples, xDims]);
    xTrain_flat.print(true)
    console.log("XTest");
    const xTest_flat = data_reshaped.slice([numTrainExamples, 0], [numTestExamples, xDims]);
    xTest_flat.print(true)
    console.log("yTRAIN");
    const yTrain = encoded_targets.slice([0, 0], [numTrainExamples, 3]);
    yTrain.print(true)
    console.log("yTest");
    const yTest = encoded_targets.slice([numTrainExamples, 0], [numTestExamples, 3]);
    yTest.print(true)

    var xTrain = xTrain_flat.reshape([numTrainExamples, time_step, feature_count])
    console.log(xTrain.shape)

    var xTest = xTest_flat.reshape([numTestExamples, time_step, feature_count])
    console.log(xTest.shape)

    var newyTrain = yTrain.asType('float32')
    var newyTest = yTest.asType('float32')
    console.log(newyTrain.shape)
    console.log(newyTest.shape)

    return [xTrain, newyTrain, xTest, newyTest];

}

//the data initially comes in a json format from the mongodb so I convert it to array
async function convert_to_array(db){

    let array = db.map(obj => Object.values(obj)); //convert json into an array
    console.log("From json to array")
    console.log(array)

    let targets = []; //array for storing target values
    const array_no_id = []; //array for accelerometer values
    const data_position = array[0].length - 1; //length of a data instance

    //for loop to delete the id column that is mandatory to store in a db
    for (let i = 0; i < array.length; i++) {
        let data =  array[i].slice(1, data_position) // 1 because we need to omit field of id
        let target_value = array[i][data_position]
        targets.push(target_value)
        array_no_id[i] = data.concat(target_value)
    }

    let number_of_classes = targets.filter(onlyUnique).length //filter out the duplicates from an array to get the number of classes

    console.log("Array with no id")
    console.log(array_no_id)

    return [array_no_id, number_of_classes];
}


function getData(testsplit, dataset, number_of_classes){
    const result = tf.tidy(() => { //tf.tidy is a function in tensor flow preventing memory leaks, it requires to have a function inside of it
        const dataByClass = []; // array where we will store only data
        const targetsByClass = []; //array where we will store corresponding target values
        var window_size = 15;

        var overlap_ratio = 0
        const overlap = Math.round(window_size * overlap_ratio);
        console.log(overlap)

        console.log(dataset);

        for (let i = 0; i < number_of_classes; i++) { //fill up the arrays with empty arrays amounting to the number of classes
            dataByClass.push([])
            targetsByClass.push([])
        }

        if(overlap != 0){
            var scope = dataset.slice(0, window_size + 2*overlap)
            console.log(scope)
            var states = getColumn(scope, scope[0].length-1)
            var most_occoruring_state = getmode(states)
            console.log(most_occoruring_state)
            var val_no_target = []
            for (const example of scope) {
                const data = example.slice(0, example.length - 1)
                val_no_target.push(data)
            }
            dataByClass[most_occoruring_state].push(val_no_target);
            targetsByClass[most_occoruring_state].push(most_occoruring_state);

        }
        //data is segregated into arrays of arrays to then convert them into tensors
        for (var i = window_size + 2*overlap; i <= dataset.length - window_size - overlap; i += window_size ) {
            var window_scope = dataset.slice(i-overlap, i+window_size+overlap)
            var states = getColumn(window_scope, window_scope[0].length-1)
            var most_occoruring_state = getmode(states)
            console.log(most_occoruring_state)

            var val_no_target = []
            for (const example of window_scope) {

                const data = example.slice(0, example.length - 1)
                console.log(data)
                //console.log(data)
                val_no_target.push(data)
            }
            dataByClass[most_occoruring_state].push(val_no_target);
            targetsByClass[most_occoruring_state].push(most_occoruring_state);

        }
        console.log("LMAOLMAO")
        console.log(dataByClass[0])
        console.log(targetsByClass[0])

        //Initialize the arrays for training and testing
        const xTrains = []
        const yTrains = []
        const xTests = []
        const yTests = []

        //push in the tensors in a loop so that it can divide the test data properly
        for (var i = 0; i < number_of_classes; i++) {
            const [xTrain, yTrain, xTest, yTest] = convertToTensors(dataByClass[i], targetsByClass[i], testsplit)
            xTrains.push(xTrain)
            yTrains.push(yTrain)
            xTests.push(xTest)
            yTests.push(yTest)
        }
        const concatAxis = 0;

        return [
            tf.concat(xTrains, concatAxis),
            tf.concat(yTrains, concatAxis),
            tf.concat(xTests, concatAxis),
            tf.concat(yTests, concatAxis),
        ]
    });
    return result;
}

async function trainModel (xTrain, yTrain, xTest, yTest){
    console.log("Final training tensors")
    xTrain.print(true)
    yTrain.print(true)
    xTest.print(true)
    yTest.print(true)

    console.log(xTrain.shape)
    console.log(yTrain.shape)
    console.log(xTest.shape)
    console.log(yTest.shape)

    global.model = tf.sequential(); //creating an empty architecture for the model
    const learningRate = .001;
    const numberofEpochs = 200;


    const optimizer = tf.train.sgd(learningRate)

    console.log(yTrain.shape)
    console.log(xTest.shape)
    console.log(yTest.shape)

    global.model.add(tf.layers.lstm({units: 100, inputShape: [15, 3], activation: 'linear', returnsequences: true}))//, returnSequences: true}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

   
    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

   
    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

   
    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    
    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));


    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'linear', units: 20}));

    global.model.add(tf.layers.dense({activation: 'softmax', units: 3}));


    global.model.compile({ optimizer: optimizer, loss: 'categoricalCrossentropy' , metrics: ['accuracy']}); //compiles the model and prepares for training by adding an optimizer, loos function and metrics

    const options = { epochs: numberofEpochs,  validationData: [xTest, yTest],
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log("Epoch: " + epoch + " Logs:" + logs.loss);
                send_epoch = epoch;
                send_loss = logs.loss;
                await tf.nextFrame();
            },
        }
    }


//fit is used to train the model with data examples against their target values
    const history = await global.model.fit(xTrain, yTrain, options); //trains a model for a fixed number of epochs
    console.log(history);
    training_finished = true;
    return global.model

}

function getmode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

