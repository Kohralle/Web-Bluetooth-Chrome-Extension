

function start_prediction() {
    if (isConnected === false){
        send_to_popup("Please connect")
    }

    else{
        characteristic_object.addEventListener('characteristicvaluechanged', make_prediction_object);
        characteristic_object.startNotifications()
            .then(_ => {
                console.log('Start reading...')
            })
            .catch(error => {
                console.log('[ERROR] Start: ' + error)
            })
    }

}

let counter = 0;
let prediction_array = [];
function make_prediction_object(event) {

    const littleEndian = true;
    let quaternion = {
        x : event.target.value.getInt16(0, littleEndian) / 64,
        y : event.target.value.getInt16(2, littleEndian) / 64,
        z : event.target.value.getInt16(4, littleEndian) / 64
    }

    if (counter < 15) {
        const quaternion_array = Object.values(quaternion)
        prediction_array.push(quaternion_array)
        counter = counter + 1;
    }

    else {
        let message = {message: "get_prediction", data: prediction_array}
        send_to_background(message)
        prediction_array = []
        counter = 0;

    }
}

function stop_notifications_for_predict() {
    characteristic_object.removeEventListener('characteristicvaluechanged', make_prediction_object);
    characteristic_object.stopNotifications()
        .then(_ => {
            console.log('Stop reading...')
            send_to_popup("disable stop button")
        })
        .catch(error => {
            console.log('[ERROR] Stop: ' + error)
        })
}