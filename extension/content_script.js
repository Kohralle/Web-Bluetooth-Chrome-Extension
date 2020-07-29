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
            train_model();
            training_status_interval = setInterval(check_training_status, 1000);
        }
    //------------------Predict Tab---------------//

        else if(request.message === "predict"){
            start_notifications_for_ml();
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
    console.log(accelerometer)
    send_request(accelerometer)
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
                console.log(data)
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

function train_model(){

    fetch('http://localhost:8080/getdata').then(response => {
        return response.json()
    })
        .then(whole_database=>{
            const result = JSON.parse(whole_database.payload) // returns all database data in json format
            console.log(result);
            return result
        })
};



function assess_interval(data){
    console.log(typeof data)
    if(data === false){
        send_to_popup("Training in progress...")
        console.log(data)
    }
    else if(data === true){
        send_to_popup("Training Completed")
        clearInterval(training_status_interval);
    }
}

function check_training_status() {
    fetch('http://localhost:8080/learning_progress')
        .then(response => response.json())
        .then(data => assess_interval(data));
}









function send_request(value){
    const data = value

    const options = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch('http://localhost:8080/handle', options).then(response=>{

    })

};





