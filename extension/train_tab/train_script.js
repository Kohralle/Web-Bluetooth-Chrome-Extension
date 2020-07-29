
function train() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "train"});
    });
}

function load_model() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "load_model"});
    });
}


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("train").addEventListener("click", train);
    document.getElementById("predefined_model").addEventListener("click", load_model);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if(message.message == "Training in progress..." || message.message == "Training Completed"){
        document.getElementById("train_status").innerHTML = message.message;
    }




    sendResponse({
        data: "Success!"
    });
});

