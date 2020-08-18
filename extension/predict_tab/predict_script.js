function start_prediction() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "predict"});
    });
}

function stop_prediction() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "stop"});
    });
}

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("predict").addEventListener("click", start_prediction);
    document.getElementById("stop_predict").addEventListener("click", stop_prediction);
});



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(typeof message)

    if (message.message == 0){
        document.getElementById("prediction").innerHTML = "Sitting";
        document.getElementById("prediction").style.fontSize = "x-large"
    }

    else if (message.message == 1){
        document.getElementById("prediction").innerHTML = "Walking";
        document.getElementById("prediction").style.fontSize = "x-large"
    }

    else if (message.message == 2){
        document.getElementById("prediction").innerHTML = "Standing";
        document.getElementById("prediction").style.fontSize = "x-large"
    }

    else if(message.message === "disable stop button"){
        document.getElementById("prediction").innerHTML = "Stopped";
    }

    else if(message.message === "Please connect"){
        document.getElementById("prediction").innerHTML = "Device is not connected";
        document.getElementById("prediction").style.fontSize = "small"
        document.getElementById("prediction").style.width = "140px"

    }

    sendResponse({
        data: "success!"
    });
});

