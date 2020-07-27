function get_db(){

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message":"get_database"});
    });
}

function reset_data() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message":"reset_database"});
    });
}
get_db();

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("reset").addEventListener("click", reset_data);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(typeof message)
    console.log(message)
    if (message.message.message == "data"){
        //document.getElementById("prediction").innerHTML = "Sitting";
        console.log(message.message.database);
        let rows = message.message.database

        let sit_counter = 0;
        let walk_counter = 0;
        let stand_counter = 0;

        for (let i = 0; i < rows.length; i++) {
            if(rows[i].target === 0){
                rows[i].target = "Sitting"
                sit_counter++;
            }
            else if (rows[i].target === 1){
                rows[i].target = "Walking"
                walk_counter++;
            }
            else if (rows[i].target === 2){
                rows[i].target = "Standing"
                stand_counter++
            }
        }

        var html = "<table class=\"zui-table\">\n" +
            "<thead>" +
            "<tr>" +
            "<th>X-axis</th>" +
            "<th>Y-axis</th>" +
            "<th>Z-axis</th>" +
            "<th>Target</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>";

        for (var i = 0; i < rows.length; i++) {
            html+="<tr>";
            html+="<td>"+rows[i].x_axis+"</td>";
            html+="<td>"+rows[i].y_axis+"</td>";
            html+="<td>"+rows[i].z_axis+"</td>";
            html+="<td>"+rows[i].target+"</td>";
            html+="</tr>";
        }

        html+="</tbody>" + "</table>";

        document.getElementById("box").innerHTML = html;
        document.getElementById("data_statistics").innerHTML = `Data Statistics`
        document.getElementById("total_entry").innerHTML = `Total entries: ${rows.length}`;
        document.getElementById("walk_entry").innerHTML = `Walking entries: ${walk_counter}`;
        document.getElementById("sit_entry").innerHTML = `Sitting entries: ${sit_counter}`;
        document.getElementById("stand_entry").innerHTML = `Standing entries: ${stand_counter}`

        if(rows.length===0){
            document.getElementById("database_empty").innerHTML = `The Database is Empty`
        }
    }

    else if (message.message == "database reset"){
        get_db()
        setTimeout(
            function() {
                document.getElementById("database_empty").innerHTML = `The Database is Empty`

            }, 1100);

    }


    sendResponse({
        data: "success!"
    });
});
