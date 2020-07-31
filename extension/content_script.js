let isConnected = false;
let training_status_interval;
let pull_database_interval;
let collect_state;

function send_to_popup(message){
    chrome.runtime.sendMessage({
        message
    }, function (response) {
        console.dir(response);
    });
}

//Used for handling the incoming messages from the popup script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
    //------------------Connect Tab-------------------//
        if(request.message === "connect" ) {
            onConnectButtonClick(); //establish_connection.js
        }

        else if(request.message === "disconnect"){
            onDisconnectButtonClick(); //establish_connection.js
        }

        else if(request.message === "connection_state_inquiry") {
            send_to_popup(isConnected)
        }
    //------------------Collect Tab------------------//
        else if(request.message === "read_values"){
            start_notifications();
        }

        else if(request.message === "stop_values"){
            stop_notifications();
        }

        else if(request.message === "set_state_sitting"){
            collect_state = "Sitting"
            fetch_state(0)
        }

        else if(request.message === "set_state_walking"){
            collect_state = "Walking"
            fetch_state(1)
        }

        else if(request.message === "set_state_standing"){
            collect_state = "Standing"
            fetch_state(2)
        }

        else if(request.message == "collect_state_inquiry"){
            send_to_popup(collect_state)
        }
    //------------------Data Tab--------------------//

        else if(request.message == "get_database"){
            pull_database_interval = setInterval(databaseForDataTab, 1000);
        }

        else if(request.message == "reset_database"){
            reset_database();
        }

    //------------------Train Tab------------------//
        else if(request.message === "train"){
            sendTrainModelRequest();
            training_status_interval = setInterval(check_training_status, 1000);
        }
        
        else if(request.message === "load_model"){
            loadModelRequest();
        }
    //------------------Predict Tab---------------//

        else if(request.message === "predict"){
            start_prediction(); //predict.js
        }

        else if(request.message === "stop"){
            stop_notifications();
        }

        else if(request.text === "getStuff"){
            alert("GGUBER ZIEN2 TO PARUWA")
        }
    }
);

/*This function is responsible for making the thingy emit accelerometer values.
It works on the addEventListener feature in JS, every time the thingy changes the
accelerometer values a data object is created and sent to the database. The rate at
which the device changes the values can be set in the official nordic thingy app.
Additionally I added a number of if statements for the sake of bettering the UX*/

function start_notifications() {
    if (isConnected === false){
        console.log(isConnected);
        send_to_popup("Device is not connected")
    }
    else {
        if(collect_state === "Sitting"|| collect_state === "Walking"|| collect_state ==="Standing"){

            characteristic_object.addEventListener('characteristicvaluechanged', make_data_object);
            characteristic_object.startNotifications() //most code editors don't recognize this function
                .then(_ => {
                    console.log('Start reading...')
                    send_to_popup("disable start button")
                })
                .catch(error => {
                    console.log('ERROR:' + error)
                })
        }

        else {
            send_to_popup("Choose a state first")
        }
    }
}

function make_data_object(event) {
    const littleEndian = true
    let accelerometer = {
        //This way of reading values was taken from the official Nordic github account
        x: event.target.value.getInt16(0, littleEndian) / 64,
        y: event.target.value.getInt16(2, littleEndian) / 64,
        z: event.target.value.getInt16(4, littleEndian) / 64,
        //t : key_value
    }
    send_to_popup(accelerometer)
    
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

function stop_notifications() {
    characteristic_object.removeEventListener('characteristicvaluechanged', make_data_object);
    characteristic_object.stopNotifications()
        .then(_ => {
            console.log('Stop reading...')
            send_to_popup("disable stop button")
        })
        .catch(error => {
            console.log('[ERROR] Stop: ' + error)
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
/*
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
            console.log(data)
            if(data === false){
                send_to_popup("Training in progress...")
                console.log(data)
            }
            else if(data === true){
                send_to_popup("Training Completed")
                clearInterval(training_status_interval);
            }
        }).catch(error => {
        console.log('ERROR: ' + error)})
}
*/
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



