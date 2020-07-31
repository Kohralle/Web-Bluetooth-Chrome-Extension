let pull_database_interval
let training_status_interval
let trainTabState

function send_to_popup(message){
    chrome.runtime.sendMessage({
        message
    }, function (response) {
        console.dir(response);
    });
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse)
{
    //------------------Collect Tab------------------//
    if (request.background.hasOwnProperty('x') === true
        && request.background.hasOwnProperty('y') === true
        && request.background.hasOwnProperty('z') === true){
        store_values(request.background);
    }

    if(request.background === "set_state_sitting"){
        fetch_state(0)
    }

    else if(request.background === "set_state_walking"){
        fetch_state(1)
    }

    else if(request.background === "set_state_standing"){
        fetch_state(2)
    }

    else if(request.background == "collect_state_inquiry"){
        send_to_popup(collect_state)
    }
    //------------------Data Tab--------------------//
    else if(request.background === "reset_database"){
        reset_database();
    }

    else if(request.background === "get_database"){
        pull_database_interval = setInterval(databaseForDataTab, 1000);
    }

    //------------------Train Tab------------------//
    else if(request.background === "train"){
        training_status_interval = setInterval(check_training_status, 1000);
        sendTrainModelRequest();

    }

    else if(request.background === "load_model"){
        trainTabState = "Pretrained model loaded";
        loadModelRequest();
    }

    else if(request.background === "Pretrained model loaded"
        || request.background === "Your own model loaded" ){
        trainTabState = request.background
    }

    else if(request.background === "train tab inquiry"){
        send_to_popup(trainTabState)
    }

    else if(request.background.message === "get_prediction"){
        get_prediction(request.background.data)
    }


})
function store_values(accelerometer) {

    const options = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(accelerometer)
    };

    fetch('http://localhost:8080/store_values', options).then(response=>response.json())
        .then(data => console.log('Response from http://localhost:8080/store_values:' + data))
        .catch(error => {
            console.log('ERROR: ' + error)
        })
}


/*Sends the information about the current collected state to the server, so that
then it can be concatenated with accelerometer values and sent to the database.*/

function fetch_state(data) {
    let message = {state: data}
    const options = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(message)
    };
    fetch('http://localhost:8080/set_state', options)
        .then(response=>response.json())
        .then(data => console.log('Response from http://localhost:8080/set_state:' + data))
        .catch(error => {
            console.log('ERROR: ' + error)
        })
}

/*Function for pulling on database off the server. Because there is a
discrepancy between sending the request and receiving the data I implemented
an interval that will only stop if the response from the server is of type array*/

function databaseForDataTab(){
    fetch('http://localhost:8080/pull_database')
        .then(response => response.json())
        .then(data => {
            if(Array.isArray(data)){
                clearInterval(pull_database_interval);
                let message = {message: "database", database: data}
                send_to_popup(message);
            }

        });
}

function reset_database() {
    fetch('http://localhost:8080/reset_database').then(response => response.json())
        .then(data => {
            if(data === true){
                send_to_popup("database reset")
            }
        });
}

function sendTrainModelRequest(){
    fetch('http://localhost:8080/train')
        .then(response => response.text())
        .then(data => console.log(data))
        .catch(error => {
            console.log('ERROR: ' + error)})
}

function check_training_status() {
    fetch('http://localhost:8080/learning_progress_status')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            send_to_popup(data)

            if(data.finished === true){
                clearInterval(training_status_interval);
                console.log("activated")
                send_to_popup("Training Completed")

            }
        }).catch(error => {
        console.log('ERROR: ' + error)})
}

function loadModelRequest() {
    console.log("Want to load model")

    fetch('http://localhost:8080/load_pretrained_model')
        .then(response => {
            return response.text()
        })
        .then(data => {
            console.log(data)
            let message = {message: "database", database: data}
            send_to_popup(data);
            console.log('Response from http://localhost:8080/load_pretrained_model: ' + data)

        }).catch(error => {
        console.log('ERROR: ' + error)
    })
}

function get_prediction(prediction_array) {
    const options = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(prediction_array)
    };
    fetch('http://localhost:8080/predict', options).then(response => response.json()).then(data => send_to_popup(data));

}
