let isConnected = false;
let collect_state;

function send_to_background(background) {
    chrome.runtime.sendMessage({
        background
    }, function (response) {
        console.dir(response);
    });
}

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
            send_to_background(request.message)
        }

        else if(request.message === "set_state_walking"){
            collect_state = "Walking"
            send_to_background(request.message)
        }

        else if(request.message === "set_state_standing"){
            collect_state = "Standing"
            send_to_background(request.message)
        }

        else if(request.message == "collect_state_inquiry"){
            send_to_popup(collect_state)
        }

    //------------------Predict Tab---------------//

        else if(request.message === "predict"){
            console.log("starting prediction");
            start_prediction(); //predict.js
        }

        else if(request.message === "stop"){
            stop_notifications_for_predict(); //predict.js
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
    }
    send_to_popup(accelerometer)
    send_to_background(accelerometer)
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










