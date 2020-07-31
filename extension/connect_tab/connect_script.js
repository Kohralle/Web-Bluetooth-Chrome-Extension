

inquireForButton();

// sends a request to content script to connect the thingy
function connect() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "connect"});
    });
}

// sends a request to content script to disconnect the thingy
function disconnect(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "disconnect"});

    });
}

// This function is called every time the connect tab is clicked on,
// It is used for determining which button should be put on screen
// (connect or disconnect) depending on the connection state in the content scripts
function inquireForButton(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        let activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "connection_state_inquiry"});
    });
}

//message handler for requests from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    //changing UI messages
    if(message.message == 'Connected!'
        || message.message == 'Disconnected'
        || message.message == 'Getting Characteristic...'
        || message.message == 'Getting Service...'
        || message.message == 'Disconnecting from Bluetooth Device...'
        || message.message == 'Requesting Device Object...'
        || message.message == "Bluetooth Device is already disconnected"){

        document.getElementById("connected").innerHTML = message.message;
    }

    //hide the disconnect button and show connect button if there is no connection
    else if(message.message == false){

        if (document.getElementById('connect') == null) {
            createConnectButton();
            document.getElementById("connected").innerHTML = "Click the button below to connect";

            if(document.getElementById('disconnect') != null){
                const element = document.getElementById('disconnect');
                element.parentNode.removeChild(element);
            }
        }
    }

    //hide the connect button and show disconnect button if there is a connection
    else if(message.message == true){

        if(document.getElementById('disconnect') == null){
            createDisconnectButton();
            document.getElementById("connected").innerHTML = "Connected";
        }

        if (document.getElementById('connect') != null){
            const element = document.getElementById('connect');
            element.parentNode.removeChild(element);
        }
    }

    else if(message.kupa === "kupa"){
        alert("kupaa")
    }

    sendResponse({
        data: "Success!"
    });
});

function createDisconnectButton() {
    const button = document.createElement("button");
    button.innerHTML = "Disconnect";
    button.id = "disconnect";

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener ("click", function() {
        disconnect();
    });
}

function createConnectButton() {
    const button = document.createElement("button");
    button.innerHTML = "Connect";
    button.id = "connect";

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener ("click", function() {
        connect();
    });
}

