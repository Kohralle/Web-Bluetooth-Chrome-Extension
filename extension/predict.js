function start_prediction() {
    if (isConnected === false){
        send_to_popup("Please connect")
    }

    else{
        characteristic_object.addEventListener('characteristicvaluechanged', make_prediction_object);
        console.log("YUH");
        characteristic_object.startNotifications()
            .then(_ => {
                console.log('Start reading...')
            })
            .catch(error => {
                console.log('[ERROR] Start: ' + error)
            })

        //return write_temperature_for_ml
    }

}

var counter = 0;
var prediction_array = [];

function make_prediction_object(event) {

    const littleEndian = true;
    var quaternion = {
        x : event.target.value.getInt16(0, littleEndian) / 64,
        y : event.target.value.getInt16(2, littleEndian) / 64,
        z : event.target.value.getInt16(4, littleEndian) / 64
    }

    //let dataa = normalize_data2(Object.values(quaternion))
    if (counter < 15) {
        const quaternion_array = Object.values(quaternion)
        prediction_array.push(quaternion_array)
        //console.log(prediction_array)
        counter = counter + 1;
    }

    else {
        const options = {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(prediction_array)
        };
        fetch('http://localhost:8080/predict', options).then(response => response.json()).then(data => send_to_popup(data));
    }

    function send_to_popup(prediction) {
        chrome.runtime.sendMessage({
            prediction
        }, function (response) {
            console.dir(response);
        });
    }
}