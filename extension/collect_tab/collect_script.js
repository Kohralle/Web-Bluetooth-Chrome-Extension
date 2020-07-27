
function read() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "read"});
    });
}

function stop() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "stop"});
    });
}

function sitting() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "sitting"});
        document.getElementById("collect_state").innerHTML = "Sitting";
    });
}

function walking() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "walking"});
        document.getElementById("collect_state").innerHTML = "Walking";
    });
}

function standing() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "standing"});
        document.getElementById("collect_state").innerHTML = "Standing";
    });
}

function inquire_for_state(){

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "collect_state_inquiry"});

    });
}
inquire_for_state();

document.addEventListener("DOMContentLoaded", function() {
    //document.getElementById("connect").addEventListener("click", init_connect);
    document.getElementById("emit_values").addEventListener("click", read);
    document.getElementById("stop_values").addEventListener("click", stop);
    document.getElementById("sitting").addEventListener("click", sitting);
    document.getElementById("walking").addEventListener("click", walking);
    document.getElementById("standing").addEventListener("click", standing);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if(message.message == "Standing"||message.message == "Walking"||message.message == "Sitting"){
        document.getElementById("collect_state").innerHTML = message.message ;
    }

    //document.getElementById("p1").innerHTML = message.quarterion.x;
    document.getElementById("x").innerHTML = message.quaternion.x;
    document.getElementById("y").innerHTML = message.quaternion.y;
    document.getElementById("z").innerHTML = message.quaternion.z;

    sendResponse({
        data: "I am fine, thank you. How is life in the background?"
    });
});

