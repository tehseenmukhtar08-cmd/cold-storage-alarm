let temperature = -18;

let doorOpen = false;

const temperatureDisplay = document.getElementById("temperature");
const doorButton = document.getElementById("doorButton");
const statusDisplay = document.getElementById("status");
const minimumDisplay = document.getElementById("minimum");
const maximumDisplay = document.getElementById("maximum");
const alarmDurationDisplay = document.getElementById("alarmDuration");
const peakTemperatureDisplay = document.getElementById("peakTemperature");

let minimumTemperature = -18;
let maximumTemperature = -18;

let alarmActive = false;
let alarmStartTime = null;
let alarmDuration = 0;
let peakTemperature = -18;


// ======================================
// Door Open / Closed
// ======================================

doorButton.addEventListener("click", function () {

    doorOpen = !doorOpen;

    if (doorOpen) {

        doorButton.textContent = "Door Open";
        doorButton.style.backgroundColor = "#d32f2f";

    } else {

        doorButton.textContent = "Door Closed";
        doorButton.style.backgroundColor = "#1565c0";

    }

});


// ======================================
// Save Alarm to SQL Server
// ======================================

function saveAlarm() {

    fetch("/save_alarm", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            alarm_type: "CRITICAL",
            peak_temperature: peakTemperature,
            duration_seconds: alarmDuration

        })

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            console.log("Alarm saved successfully");

        } else {

            console.log("Alarm save failed:", data.message);

        }

    })

    .catch(error => {

        console.log("Connection error:", error);

    });

}


// ======================================
// Temperature Simulation
// ======================================

setInterval(function () {


    // Door OPEN → Temperature increases

    if (doorOpen) {

        temperature = temperature + 1;

    }


    // Door CLOSED → Temperature decreases

    else {

        if (temperature > -18) {

            temperature = temperature - 1;

        }

    }


    // ==================================
    // Minimum Temperature
    // ==================================

    if (temperature < minimumTemperature) {

        minimumTemperature = temperature;

    }


    // ==================================
    // Maximum Temperature
    // ==================================

    if (temperature > maximumTemperature) {

        maximumTemperature = temperature;

    }


    // ==================================
    // Display Temperature
    // ==================================

    temperatureDisplay.textContent =
        temperature + "°C";


    // Display Minimum and Maximum

    minimumDisplay.textContent =
        minimumTemperature + "°C";

    maximumDisplay.textContent =
        maximumTemperature + "°C";


    // ==================================
    // CRITICAL ALARM
    // ==================================

    if (temperature > -5) {


        // Alarm starts

        if (!alarmActive) {

            alarmActive = true;

            alarmStartTime = Date.now();

            peakTemperature = temperature;

        }


        // Update Peak Temperature

        if (temperature > peakTemperature) {

            peakTemperature = temperature;

        }


        // Calculate Alarm Duration

        alarmDuration = Math.floor(
            (Date.now() - alarmStartTime) / 1000
        );


        // Display Critical Alarm

        statusDisplay.textContent =
            "🚨 CRITICAL ALARM";

        statusDisplay.classList.add(
            "critical-alarm"
        );


        // Display Alarm Duration

        alarmDurationDisplay.textContent =
            alarmDuration + " seconds";


        // Display Peak Temperature

        peakTemperatureDisplay.textContent =
            peakTemperature + "°C";

    }


    // ==================================
    // WARNING
    // ==================================

    else if (temperature >= -9) {


        // Critical Alarm Ends

        if (alarmActive) {


            alarmDuration = Math.floor(
                (Date.now() - alarmStartTime) / 1000
            );


            // Save Alarm to Database

            saveAlarm();


            alarmActive = false;


            statusDisplay.textContent =
                "🟡 WARNING";

            statusDisplay.classList.remove(
                "critical-alarm"
            );


            statusDisplay.style.backgroundColor =
                "#fff3cd";

            statusDisplay.style.color =
                "#856404";


            alarmDurationDisplay.textContent =
                alarmDuration + " seconds";

        }


        else {

            statusDisplay.textContent =
                "🟡 WARNING";

            statusDisplay.classList.remove(
                "critical-alarm"
            );

            statusDisplay.style.backgroundColor =
                "#fff3cd";

            statusDisplay.style.color =
                "#856404";

        }

    }


    // ==================================
    // NORMAL
    // ==================================

    else {


        // Critical Alarm Ends

        if (alarmActive) {


            alarmDuration = Math.floor(
                (Date.now() - alarmStartTime) / 1000
            );


            // Save Alarm to Database

            saveAlarm();


            alarmActive = false;

        }


        statusDisplay.textContent =
            "🟢 NORMAL";

        statusDisplay.classList.remove(
            "critical-alarm"
        );


        statusDisplay.style.backgroundColor =
            "#d4edda";

        statusDisplay.style.color =
            "#155724";

    }


}, 2000);