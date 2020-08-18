// all these functions are signals to start the execution of features in the content_script.js file
function read() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "read_values"});
    });
}

function stop() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "stop_values"});
    });
}

function sitting() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "set_state_sitting"});
        document.getElementById("collect_state").innerHTML = "Sitting";
    });
}

function walking() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "set_state_walking"});
        document.getElementById("collect_state").innerHTML = "Walking";
    });
}

function standing() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "set_state_standing"});
        document.getElementById("collect_state").innerHTML = "Standing";
    });
}

//inquires for state fo the user can see what is the last state that was collected
function inquire_for_state(){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "collect_state_inquiry"});

    });
}
inquire_for_state();

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("emit_values").addEventListener("click", read);
    document.getElementById("stop_values").addEventListener("click", stop);
    document.getElementById("sitting").addEventListener("click", sitting);
    document.getElementById("walking").addEventListener("click", walking);
    document.getElementById("standing").addEventListener("click", standing);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    //for setting the state in the window
    if(message.message == "Standing"||message.message == "Walking"||message.message == "Sitting"){
        document.getElementById("collect_state").innerHTML = message.message ;
    }

    //disable the start button once collecting has started to avoid collecting duplicates as
    //multiple functions for data collection can be called at the same time
    else if (message.message === "disable start button"){
        document.getElementById("stop_values").removeEventListener("click", cantClickStopAlert);
        document.getElementById("stop_values").addEventListener("click", stop);
        document.getElementById("emit_values").removeEventListener("click", read);
        document.getElementById("emit_values").addEventListener("click",cantClickStartAlert);
        document.getElementById("collect_alert").innerText =""
    }

    //same idea as above but for the stop button
    else if (message.message === "disable stop button"){
        document.getElementById("emit_values").removeEventListener("click", cantClickStartAlert);
        document.getElementById("emit_values").addEventListener("click", read);
        document.getElementById("stop_values").removeEventListener("click", stop);
        document.getElementById("stop_values").addEventListener("click",cantClickStopAlert);
        document.getElementById("collect_alert").innerText =""

    }

    else if (message.message === "Choose a state first"){
        document.getElementById("collect_alert").innerText = message.message;
    }

    else if (message.message === "Device is not connected"){
        document.getElementById("collect_alert").innerText = message.message;
    }

    //else if((typeof message.message) === "object") {
    else if(message.message.hasOwnProperty('x') === true) {
        document.getElementById("x").innerHTML = message.message.x;
        document.getElementById("y").innerHTML = message.message.y;
        document.getElementById("z").innerHTML = message.message.z;
    }

    sendResponse({
        data: "Success! (collect tab)"
    });
});

//user prompts used as callback in the event listener
function cantClickStartAlert() {
    document.getElementById("collect_alert").innerText ="Reading already in progress!"
}

function cantClickStopAlert() {
    document.getElementById("collect_alert").innerText ="Nothing to stop"
}