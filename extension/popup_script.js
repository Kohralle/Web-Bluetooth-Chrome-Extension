
function init_connect() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "connect"});
        console.log("CLICKEDDD")
    });
}

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

function train() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "train"});
    });
}

function predict() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "predict"});
    });
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("connect").addEventListener("click", init_connect);
    document.getElementById("emit_values").addEventListener("click", read);
    document.getElementById("stop_values").addEventListener("click", stop);
    document.getElementById("train").addEventListener("click", train);
    document.getElementById("predict").addEventListener("click", predict);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    document.getElementById("p1").innerHTML = message.prediction;
    //document.getElementById("p1").innerHTML = message.quaternion.x;
    //document.getElementById("p2").innerHTML = message.quaternion.y;
    //document.getElementById("p3").innerHTML = message.quaternion.z;

    sendResponse({
        data: "I am fine, thank you. How is life in the background?"
    });
});

