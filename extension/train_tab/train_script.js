let epoch_progress;
let interval;
function send_to_background(background) {
    chrome.runtime.sendMessage({
        background
    }, function (response) {
        console.dir(response);
    });
}

function train() {
   send_to_background("train")
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
    console.log(message)
    if(message.message == "Training in progress..."){
        clearInterval(interval);
        document.getElementById("train_status").innerHTML = message.message;
    }

    else if(message.message == "Training Completed" || message.message =="The model has loaded"){
    document.getElementById("train_status").innerHTML = message.message;
    }
    console.log(message.message.hasOwnProperty('epoch') +"YO YO")
    if(message.message.hasOwnProperty('epoch') === true){

        epoch_progress = message.message.epoch

        var i = 0;


        i = 1;
        var elem = document.getElementById("myBar");
        var width = 1;
        interval = setInterval(frame, 100);
        function frame() {
            if (epoch_progress === message.message.num_epoch - 1 || epoch_progress === 0) {

                elem.style.width = 100 + "%"
                clearInterval(interval);
                i = 0;
                epoch_progress = 0;
                document.getElementById("myProgress").style.display = "none"
            } else {
                if (document.getElementById("myProgress").style.display === "none") {
                    document.getElementById("myProgress").style.display = "block"
                }
                
                console.log("epochs: " + epoch_progress)
                let rate = 100 / message.message.num_epoch
                console.log("rate: " + rate)
                console.log(epoch_progress*rate)
                let progress = Math.round(epoch_progress*rate)
                document.getElementById("train_status").innerText = `Training in progress... ${progress}%`
                elem.style.width = (epoch_progress * rate) + "%";
            }
        }
    }




    sendResponse({
        data: "Success!"
    });
});

