inquireForButton();

function connect() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "connect"});
    });
}

function disconnect(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "disconnect"});

    });
}

function inquireForButton(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "inquiry"});
        console.log("CLICKEDDD")
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message)

    if(message.message == 'Connected!' || message.message == 'Disconnected'
        || message.message == 'Getting Characteristic...' || message.message == 'Getting Service...'
        || message.message == 'Disconnecting from Bluetooth Device...' || message.message == 'Requesting Device Object...'){
        document.getElementById("connected").innerHTML = message.message;

    }

    else if(message.message == false){

        if (document.getElementById('connect') == null) {
            createConnectButton();
            document.getElementById("connected").innerHTML = "Click the button below to connect";

            if(document.getElementById('disconnect') != null){
                const elem = document.getElementById('disconnect');
                elem.parentNode.removeChild(elem);
            }
        }
        //inquireForButton();

    }

    else if(message.message == true){

        if(document.getElementById('disconnect') == null){
            createDisconnectButton();
            document.getElementById("connected").innerHTML = "Connected";
        }

        if (document.getElementById('connect') != null){
            const elem = document.getElementById('connect');
            elem.parentNode.removeChild(elem);
        }
    }

    sendResponse({
        data: "Success!"
    });
});


function createDisconnectButton() {
    //document.getElementById("connected").innerHTML = "Connected!";
    var button = document.createElement("button");
    button.innerHTML = "Disconnect";
    button.id = "disconnect";

    var body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener ("click", function() {
        disconnect();
    });
}

function createConnectButton() {
    //document.getElementById("connected").innerHTML = "Connected!";
    var button = document.createElement("button");
    button.innerHTML = "Connect";
    button.id = "connect";

    var body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener ("click", function() {
        connect();
    });
}

