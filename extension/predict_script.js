function predict() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "predict"});
    });
}

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("predict").addEventListener("click", predict);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(typeof message)
    if (message.prediction == 0){
        document.getElementById("prediction").innerHTML = "Sitting";
    }

    else if (message.prediction == 1){
        document.getElementById("prediction").innerHTML = "Walking";
    }

    else if (message.prediction == 2){
        document.getElementById("prediction").innerHTML = "Standing";
    }

    //document.getElementById("p1").innerHTML = message.quaternion.x;
    //document.getElementById("p2").innerHTML = message.quaternion.y;
    //document.getElementById("p3").innerHTML = message.quaternion.z;

    sendResponse({
        data: "I am fine, thank you. How is life in the background?"
    });
});

