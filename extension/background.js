function ala(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {text:"getStuff"}, function(response) {
            if(response.type == "test"){
                console.log('test received');
            }
            else {
                alert("DUPA")
            }
        });
    });
}

ala()

function send_to_popup(message){
    chrome.runtime.sendMessage({
        message
    }, function (response) {
        console.dir(response);
    });
}


chrome.runtime.onMessage.addListener( function(request, sender, sendResponse)
{
    if(request.background === "train"){
        training_status_interval = setInterval(check_training_status, 1000);
        sendTrainModelRequest();

    }
})

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
            console.log(data);
            send_to_popup(data)

            if(data.finished === true){
                clearInterval(training_status_interval);
                console.log("activated")
                send_to_popup("Training Completed")

            }
        }).catch(error => {
        console.log('ERROR: ' + error)})


}
