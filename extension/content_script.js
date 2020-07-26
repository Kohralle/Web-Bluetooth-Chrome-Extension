var isConnected = false;
var interval;
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
        if( request.message === "connect" ) {
            get_device_object();
        }
        else if(request.message === "read"){
            start_notifications();
        }
        else if(request.message === "stop"){
            stop_notifications();
        }
        else if(request.message === "train"){
            retrieve_database();
            interval = setInterval(check_training_status, 1000);
        }
        else if(request.message === "predict"){
            console.log("YOOOOO");
            start_notifications_for_ml();
            //start_notifications_for_ml();

        }

        else if(request.message === "disconnect"){
            console.log("YOOOOO");
            onDisconnectButtonClick();
            //start_notifications_for_ml();
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

        else if(request.message === "inquiry") {
            console.log("YOOOOO");

            console.log("YOOOOO");
            send_to_popup(isConnected)
        }

        else if(request.message == "collect_state_inquiry"){
            send_to_popup(collect_state)

        }

    }
);

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

        clearInterval(interval);
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

var configuration_uuid = 'ef680100-9b35-4933-9b10-52ffa9740042'

var service_uuid = 'ef680400-9b35-4933-9b10-52ffa9740042'
var characteristic_uuid = 'ef680406-9b35-4933-9b10-52ffa9740042'
var characteristic_object;
var bluetoothDevice;

function availability(){
    if (!navigator.bluetooth) {
        console.log('No Web Bluetooth connectivity, Web Bluetooth is supported on Chrome v. 56+, Opera v. 43+, Android browser v. 67+, Opera mobile v. 46+, Chrome for Android v. 70+ and Samsung Internet v 6.2+')
        //the line above displays on firefox but not on chrome, so it works as expected
        return false
    }

    else {
        return true
    }
}



function get_device_object() {

    if (availability() === true){ //check if browser supports Web Bluetooth

        let attributes = {
            //acceptAllDevices: true,
            filters: [{
                services: [configuration_uuid]
           }],
            optionalServices: [service_uuid]
        }

        console.log('Requesting Device Object');

        navigator.bluetooth.requestDevice(attributes)
            .then(thingy => { //returns a promise to an object, which we further resolve to get subsequent data
                bluetoothDevice = thingy

                let message = 'Requesting Device Object...'
                chrome.runtime.sendMessage({
                    message
                }, function (response) {
                    console.dir(response);
                });

                establish_connection(thingy)
                console.log('Sending GATT request');


            })
            .catch(error => {
                console.log(error);
            });

    }
}

function establish_connection(thingy) {

    let characteristic_uuid = 'ef680406-9b35-4933-9b10-52ffa9740042' //uuid for accelerometer

    thingy.gatt.connect()
        .then(server => { // (with arrow functions () => x is short for () => { return x; }).
            console.log('Getting Service');
            let message = 'Getting Service...';
            chrome.runtime.sendMessage({
                message
            }, function (response) {
                console.dir(response);
            });
            return server.getPrimaryService(service_uuid);
        })
        .then(service => {
            console.log('Getting Characteristic');
            let message = 'Getting Characteristic...';
            chrome.runtime.sendMessage({
                message
            }, function (response) {
                console.dir(response);
            });
            return service.getCharacteristic(characteristic_uuid);
        })
        .then(characteristic => {
            //console.log(characteristic.readValue());
            //characteristic.addEventListener('characteristicvaluechanged', write_temperature);
            characteristic_object = characteristic

            isConnected = true;

            chrome.runtime.sendMessage({
               isConnected
            }, function (response) {
                console.dir(response);
            });

            let message = "Connected!"

            chrome.runtime.sendMessage({
                message
            }, function (response) {
                console.dir(response);
            });

        }).catch(error => {
        console.log(error);
    });
}

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

        chrome.runtime.sendMessage({
            isConnected
        }, function (response) {
            console.dir(response);
        });

        let message = "Disconnected"
        chrome.runtime.sendMessage({
            message
        }, function (response) {
            console.dir(response);
        });

    } else {
        log('> Bluetooth Device is already disconnected');
    }
}

