var configuration_uuid = 'ef680100-9b35-4933-9b10-52ffa9740042'
var service_uuid = 'ef680400-9b35-4933-9b10-52ffa9740042'
var characteristic_uuid = 'ef680406-9b35-4933-9b10-52ffa9740042'
var characteristic_object;
var bluetoothDevice;

function availability(){
    if (!navigator.bluetooth) {
        alert('No Web Bluetooth connectivity, Web Bluetooth is supported on Chrome v. 56+, Opera v. 43+, Android browser v. 67+, Opera mobile v. 46+, Chrome for Android v. 70+ and Samsung Internet v 6.2+')
        //the line above displays on firefox but not on chrome, so it works as expected
        return false
    }

    else {
        return true
    }
}

function initialize_connection() {

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

                send_to_popup('Requesting Device Object...')

                establish_connection(thingy)
                console.log('Sending GATT request');


            })
            .catch(error => {
                console.log(error);
            });

    }
}

function establish_connection(thingy) {

    thingy.gatt.connect()
        .then(server => { // (with arrow functions () => x is short for () => { return x; }).
            console.log('Getting Service');
            //let message = 'Getting Service...';
           send_to_popup('Getting Service...')
            return server.getPrimaryService(service_uuid);
        })
        .then(service => {
            console.log('Getting Characteristic');
            send_to_popup('Getting Characteristic...')
            return service.getCharacteristic(characteristic_uuid);
        })
        .then(characteristic => {
            characteristic_object = characteristic
            isConnected = true;
            send_to_popup(isConnected);
            send_to_popup("Connected!")

        }).catch(error => {
        console.log(error);
    });
}