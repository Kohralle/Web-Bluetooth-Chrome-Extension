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
    //fiz this to work on send to popup
    if (message.prediction == 0){
        document.getElementById("prediction").innerHTML = "Sitting";
    }

    else if (message.prediction == 1){
        document.getElementById("prediction").innerHTML = "Walking";
    }

    else if (message.prediction == 2){
        document.getElementById("prediction").innerHTML = "Standing";
    }

    else if(message.message === "disable stop button"){
        document.getElementById("prediction").innerHTML = "Stopped";
    }

    else if(message.message === "Please connect"){
        document.getElementById("prediction").innerHTML = "Device is not connected";
        document.getElementById("prediction").style.fontSize = "small"
        document.getElementById("prediction").style.width = "140px"
        document.getElementById("prediction").style.color = "red"




    }

    sendResponse({
        data: "success!"
    });
});

