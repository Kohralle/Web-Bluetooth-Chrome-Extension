
function start_notifications_for_ml() {
    characteristic_object.addEventListener('characteristicvaluechanged', write_temperature_for_ml);
    console.log("YUH");
    characteristic_object.startNotifications()
        .then(_ => {
            console.log('Start reading...')
            //document.querySelector('#start').disabled = true
            //document.querySelector('#stop').disabled = false
        })
        .catch(error => {
            console.log('[ERROR] Start: ' + error)
        })
        console.log("YO THIS SHIT BUSSIN");
    return write_temperature_for_ml
}

var counter = 0;
var prediction_array = [];

function write_temperature_for_ml(event) {

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
        //////////

        //const data = value

        const options = {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(prediction_array)
        };
        //console.log(JSON.stringify(value));
        fetch('http://localhost:8080/predict', options).then(response=>{
            send_to_popup(response.state)
            console.log("Got prediction")
            console.log(response)
            prediction_array = []
            counter = 0;
        })

        //throw new Error("Something went badly wrong!");
    }

    function send_to_popup(prediction) {
        chrome.runtime.sendMessage({
            prediction
        }, function (response) {
            console.dir(response);
        });
    }

    //console.log("shit works");
    //console.log(quaternion);



    /*
    const input_ml = tf.tensor2d(quaternion_array, [1, 3]);
    const prediction_ml = model.predict(input_ml);
    console.log("Prediction: " + prediction_ml);
    const hahaha = prediction_ml.argMax(-1).dataSync()
    console.log(hahaha);
    console.log(hahaha[0]);
    document.getElementById("p1").innerHTML = hahaha[0];
    */
}