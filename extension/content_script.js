let isConnected = false;
let training_status_interval;
let pull_database_interval;
var collect_state;

function send_to_popup(message){
    chrome.runtime.sendMessage({
        message
    }, function (response) {
        console.dir(response);
    });
}

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
            console.log("READ VAL WORKIN")
            start_notifications();
        }
        else if(request.message === "stop_values"){
            stop_notifications();
        }

        else if(request.message === "set_state_sitting"){
            collect_state = "Sitting"
            fetch_state(0)
            console.log(collect_state);
        }

        else if(request.message === "set_state_walking"){
            collect_state = "Walking"
            fetch_state(1)
            console.log(collect_state);
        }

        else if(request.message === "set_state_standing"){
            collect_state = "Standing"
            fetch_state(2)
            console.log(collect_state);
        }

        else if(request.message == "collect_state_inquiry"){
            send_to_popup(collect_state)

        }
    //------------------Data Tab--------------------//

        else if(request.message == "get_database"){
            pull_database_interval = setInterval(get_db, 1000);

        }

        else if(request.message == "reset_database"){
            fetch('http://localhost:8080/reset_database').then(response => response.json())
                .then(data => {
                        if(data === true){
                            send_to_popup("database reset")
                        }
                    });
        }

    //------------------Train Tab------------------//
        else if(request.message === "train"){
            retrieve_database();
            training_status_interval = setInterval(check_training_status, 1000);
        }
    //------------------Predict Tab---------------//

        else if(request.message === "predict"){
            console.log("YOOOOO");
            start_notifications_for_ml();
        }
    }
);

function get_db(){
    fetch('http://localhost:8080/pull_database',{
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

    }).then(response => response.json())
        .then(data => {
            if(Array.isArray(data)){
                clearInterval(pull_database_interval);
                let message = {message: "database", database: data}
                console.log(data)
                send_to_popup(message);
            }

        });
}

function fetch_state(data) {
    let message = {state: data}
    const options = {
        method: 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(message)
    };
    //console.log(JSON.stringify(value));
    fetch('http://localhost:8080/set_state', options).then(response=>{
        //console.log(response)
        //var out = response.json()
    })
    //.then(token => { console.log(token } )
}

function assess_interval(data){
    console.log(typeof data)
    if(data == false){
        send_to_popup("Training in progress...")

        console.log(data)
    }
    else if(data == true){
        console.log("Training dun")
        send_to_popup("Training Completed")

        clearInterval(training_status_interval);
    }
}

function check_training_status() {
    setTimeout(function(){ console.log("Hello"); }, 3000);
    fetch('http://localhost:8080/learning_progress',{
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

    }).then(response => response.json())
        .then(data => assess_interval(data));
}

function retrieve_database(){

    fetch('http://localhost:8080/getdata').then(response => {
        return response.json()
    })
        .then(whole_database=>{
            const result = JSON.parse(whole_database.payload) // returns all database data in json format

            console.log(result);
            // assess_model(result)
            return result
        })

    //response.send(JSON.stringify(state));



};

function start_notifications() {
    if(collect_state === "Sitting"|| collect_state === "Walking"|| collect_state ==="Standing"){

        characteristic_object.addEventListener('characteristicvaluechanged', write_temperature);
        characteristic_object.startNotifications()
            .then(_ => {
                console.log('Start reading...')
                send_to_popup("disable start button")
            })
            .catch(error => {
                console.log('[ERROR] Start: ' + error)
            })
    }

    else {
        console.log(collect_state);
        send_to_popup("Choose a state first!")
    }

}

function write_temperature(event) {

    const littleEndian = true;
    let quaternion = {

        x: event.target.value.getInt16(0, littleEndian) / 64,
        y: event.target.value.getInt16(2, littleEndian) / 64,
        z: event.target.value.getInt16(4, littleEndian) / 64,
        //t : key_value

    };

    send_to_popup(quaternion)

    console.log(quaternion);

    send_request(quaternion)

}

function stop_notifications() {
    characteristic_object.removeEventListener('characteristicvaluechanged', write_temperature);
    characteristic_object.stopNotifications()
        .then(_ => {
            console.log('Stop reading...')
            send_to_popup("disable stop button")
        })
        .catch(error => {
            console.log('[ERROR] Stop: ' + error)
        })
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





