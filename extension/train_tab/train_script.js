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
    send_to_background("load_model")
}

function inquire() {
    send_to_background("train tab inquiry")
}

//inquire()

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("train").addEventListener("click", train);
    document.getElementById("predefined_model").addEventListener("click", load_model);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message)
    if(message.message == "Training Completed"){
        clearInterval(interval);
        send_to_background("Your own model loaded")
        document.getElementById("train_status").innerHTML = message.message;
        document.getElementById("train").disabled = false;
    }

    else if(message.message == "Training in progress..."
        || message.message =="The model has loaded"
        ||message.message == "Your own model loaded"
        ||message.message == "Pretrained model loaded"){
        document.getElementById("train_status").innerHTML = message.message;
    }

    if(message.message.hasOwnProperty('epoch') === true){
        send_to_background("dont interrupt")
        document.getElementById("train").disabled = true;
        epoch_progress = message.message.epoch
        loss = message.message.loss
        var elem = document.getElementById("myBar");
        var width = 1;
        interval = setInterval(frame, 100);
        function frame() {
            if (epoch_progress === message.message.num_epoch - 1 || epoch_progress === 0) {
                elem.style.width = 100 + "%"
                clearInterval(interval);
                epoch_progress = 0;
                document.getElementById("myProgress").style.display = "none"
            } else {

                document.getElementById("myProgress").style.display = "block"

                console.log("epochs: " + epoch_progress)
                let rate = 100 / message.message.num_epoch
                console.log("rate: " + rate)
                console.log(epoch_progress*rate)
                let progress = Math.round(epoch_progress*rate)
                document.getElementById("train_status").innerText = `Training in progress... ${progress}% \n Loss: ${loss}`
                elem.style.width = (epoch_progress * rate) + "%";
            }
        }
    }




    sendResponse({
        data: "Success!"
    });
});

