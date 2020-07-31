function send_to_background(background) {
    chrome.runtime.sendMessage({
        background
    }, function (response) {
        console.dir(response);
    });
}

//function called every time the data tab is clicked on
function get_database(){

    send_to_background("get_database")
}

function reset_database() {
    send_to_background("reset_database");
}
get_database();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    //do when database is loaded
    if (message.message.message == "database"){

        let data_values = message.message.database

        let sit_counter = 0;
        let walk_counter = 0;
        let stand_counter = 0;

        //counting the values for each state and changing the values from numbers to text
        for (let i = 0; i < data_values.length; i++) {
            if(data_values[i].target === 0){
                data_values[i].target = "Sitting"
                sit_counter++;
            }
            else if (data_values[i].target === 1){
                data_values[i].target = "Walking"
                walk_counter++;
            }
            else if (data_values[i].target === 2){
                data_values[i].target = "Standing"
                stand_counter++
            }
        }

        //setting the html for the data statistics and table
        let html = "<table class=\"data_table\">\n" +
            "<thead>" +
            "<tr>" +
            "<th>X-axis</th>" +
            "<th>Y-axis</th>" +
            "<th>Z-axis</th>" +
            "<th>Target</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>";

        for (let i = 0; i < data_values.length; i++) {
            html+="<tr>";
            html+="<td>"+data_values[i].x_axis+"</td>";
            html+="<td>"+data_values[i].y_axis+"</td>";
            html+="<td>"+data_values[i].z_axis+"</td>";
            html+="<td>"+data_values[i].target+"</td>";
            html+="</tr>";
        }

        html+="</tbody>" + "</table>";

        document.getElementById("box").innerHTML = html; //appending the table onto the extension
        document.getElementById("temp").id = "data_statistics"; // assigning css through code to make it load after database is pulled
        document.getElementById("data_statistics").innerText = `Data Statistics`
        document.getElementById("total_entry").innerText = `Total entries: ${data_values.length}`;
        document.getElementById("walk_entry").innerText = `Walking entries: ${walk_counter}`;
        document.getElementById("sit_entry").innerText = `Sitting entries: ${sit_counter}`;
        document.getElementById("stand_entry").innerText = `Standing entries: ${stand_counter}`

        //creating the button parameters to make it load nicely with the data table
        createResetButton();

        //If Database is empty, print a statement inside
        if(data_values.length===0){
            document.getElementById("database_empty").innerHTML = `The Database is Empty`
        }
    }

    //Do when has been database is reset
    else if (message.message == "database reset"){
        get_database()
        setTimeout( //timeout function for nice appearance of flushing the table
            function() {
                document.getElementById("total_entry").innerText = "Total entries: 0"
                document.getElementById("walk_entry").innerText = "Walking entries: 0";
                document.getElementById("sit_entry").innerText = "Sitting entries: 0";
                document.getElementById("stand_entry").innerText = "Standing entries: 0";
            }, 1300);
    }

    sendResponse({
        data: "success!"
    });
});

function createResetButton() {
    const button = document.createElement("button");
    button.innerText = "Reset Data";
    button.id = "reset";

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener ("click", function() {
        reset_database();
    });
}
