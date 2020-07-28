var isConnected = false;
var training_status_interval;
var collect_state;
var pull_database_interval;

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
            initialize_connection(); //establish_connection.js
        }

        else if(request.message === "disconnect"){
            console.log("YOOOOO");
            onDisconnectButtonClick();
        }

        else if(request.message === "inquiry") {
            send_to_popup(isConnected)
        }
    //------------------Collect Tab------------------//
        else if(request.message === "read"){
            start_notifications();
        }
        else if(request.message === "stop"){
            stop_notifications();
        }

        else if(request.message === "sitting"){
            collect_state = "Sitting"
            fetch_state(0)
        }

        else if(request.message === "walking"){
            collect_state = "Walking"
            fetch_state(1)
        }

        else if(request.message === "standing"){
            collect_state = "Standing"
            fetch_state(2)
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
                let message = {message: "data", database: data}
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
    characteristic_object.addEventListener('characteristicvaluechanged', write_temperature);
    characteristic_object.startNotifications()
        .then(_ => {
            console.log('Start reading...')
            //document.querySelector('#start').disabled = true
            //document.querySelector('#stop').disabled = false
        })
        .catch(error => {
            console.log('[ERROR] Start: ' + error)
        })
}

function write_temperature(event) {
    //console.log(event)
    //var now = new Date()
    //var timestamp = now.getTime();
    const littleEndian = true;
    var quaternion = {

        x : event.target.value.getInt16(0, littleEndian) / 64,
        y : event.target.value.getInt16(2, littleEndian) / 64,
        z : event.target.value.getInt16(4, littleEndian) / 64,
        //t : key_value

    }



    chrome.runtime.sendMessage({
        quaternion
    }, function (response) {
        console.dir(response);
    });


    console.log(quaternion);

    //let value = event.target.value.getInt8(0)
    send_request(quaternion)

}

function stop_notifications() {
    characteristic_object.removeEventListener('characteristicvaluechanged', write_temperature);
    characteristic_object.stopNotifications()
        .then(_ => {
            console.log('Stop reading...')
            //document.querySelector('#start').disabled = false
            //document.querySelector('#stop').disabled = true
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



function onDisconnectButtonClick() {
    console.log('Disconnecting from Bluetooth Device...');
    let message = 'Disconnecting from Bluetooth Device...';
    chrome.runtime.sendMessage({
        message
    }, function (response) {
        console.dir(response);
    });
    if (bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
        isConnected = false

        send_to_popup(isConnected)
        send_to_popup("Disconnected")

    } else {
        log('> Bluetooth Device is already disconnected');
    }
}

