const customTime = {}
var paused = true
var minutes
var timerDate
var remainingTime = 0
var darkTheme = false
var totalTime = 0

// Variables for Picture-in-Picture (PiP)
let pipWindow = null;
let pipRequestInProgress = false;

const audio = new Audio();
audio.src = "../audio/sound_trim.mp3";

function $id(id) {
    return document.getElementById(id);
}

// 🎉 Confetti Animation
function startCelebration() {
    // Add pulse animation to the timer display
    document.querySelector('#time').classList.add('pulse');
    // Create confetti animation
    const root = document.getElementById('confetti');
    if (!root) return;
    root.innerHTML = '';
    const colors = ['#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#8338EC', '#FB5607'];
    const pieceCount = 150; // Increased for more celebration effect
    const durationMin = 3000;
    const durationMax = 6000;
    for (let i = 0; i < pieceCount; i++) {
        const s = document.createElement('span');
        s.className = 'confetti';
        const left = Math.random() * 100;
        const size = 6 + Math.random() * 10;
        const delay = Math.random() * 400;
        const dur = durationMin + Math.random() * (durationMax - durationMin);
        s.style.left = `${left}vw`;
        s.style.background = colors[i % colors.length];
        s.style.width = `${size}px`;
        s.style.height = `${size * 1.4}px`;
        s.style.animationDuration = `${dur}ms`;
        s.style.animationDelay = `${delay}ms`;
        root.appendChild(s);
        setTimeout(() => s.remove(), dur + delay + 100);
    }
}

function stopCelebration() {
    // Remove pulse animation from timer display
    document.querySelector('#time').classList.remove('pulse');
    // Clear confetti
    const root = document.getElementById('confetti');
    if (root) root.innerHTML = '';
    // Reset document title
    document.title = "Custom Timer";
    // Reset timer color
    $id('time').style.color = '';
}

function onTimerComplete() {
    paused = true;
    clearInterval(interval);
    closePipWindow(); // Close PiP window on complete
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Play';
    // Hide focus text when timer completes
    $id('focus').classList.add('hide');
    // Show alarm stop button
    $id('stop-alarm').classList.remove('hidden');
    // Play alarm sound
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(error => {
        console.log('Error playing alarm sound:', error);
    });
    // Start celebration animation
    startCelebration();
}

function stopAlarm() {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    $id('stop-alarm').classList.add('hidden');
    stopCelebration();
}

// 🧮 Progress Bar Updater
function updateProgressBar() {
    if (totalTime <= 0) {
        $id("progress-bar").style.width = "0%";
        return;
    }
    const percent = ((totalTime - customTime.seconds) / totalTime) * 100;
    $id("progress-bar").style.width = percent + "%";
}

const setCustomTime = (hours = 0, minutes = 0, seconds = 0) => {
    hours = Number(hours);
    minutes = Number(minutes);
    seconds = Number(seconds);

    if (hours < 0 || minutes < 0 || seconds < 0) {
        alert("⛔ Please enter positive numbers only!");
        return;
    }
    
    // Check if at least one field has a value
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert("⛔ Please enter at least one value greater than zero!");
        return;
    }

    paused = true;
    $id('hours').innerHTML = String(hours).padStart(2, '0');
    $id('minutes').innerHTML = String(minutes).padStart(2, '0');
    $id('seconds').innerHTML = String(seconds).padStart(2, '0');
    remainingTime = 0;
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Play';
    // Hide focus text when setting new time
    $id('focus').classList.add('hide');
    customTime.seconds = (hours * 3600) + (minutes * 60) + seconds;
    totalTime = customTime.seconds; 
    updateProgressBar(); 

    $id('secondsInput').value = "";
    $id('minutesInput').value = "";
    $id('hoursInput').value = "";

}

const reset = () => {
    stopAlarm();
    closePipWindow(); // Close PiP window on reset
    // Hide focus message
    $id('focus').classList.add('hide');
    // Reset button styles
    if (darkTheme) {
        $('#timer-control').css({ "background": "transparent", "color": "#ff6b35" });
    } else {
        $('#timer-control').css({ "background": "transparent", "color": "#00ff00" });
    }
    clearInterval(interval);
    
    // Reset all timer displays to 00
    $id('hours').innerHTML = '00';
    $id('minutes').innerHTML = '00';
    $id('seconds').innerHTML = '00';
    
    // Clear all input fields
    $id('hoursInput').value = '';
    $id('minutesInput').value = '';
    $id('secondsInput').value = '';
    
    // Reset timer values
    customTime.seconds = 0;
    totalTime = 0;
    
    // Reset progress bar
    $id("progress-bar").style.width = "0%";
    
    // Reset timer color and remove any animations
    $id('time').style.color = '';
    $id('time').classList.remove('pulse');
    
    // Clear any confetti
    const confettiElem = $id('confetti');
    if (confettiElem) confettiElem.innerHTML = '';
    
    // Reset pause state
    paused = true;
    $id('timer-control').innerHTML = '<i class="fas fa-play-circle"></i> Play';
    
    // Reset document title
    document.title = 'Custom Timer';
    
    // Make sure stop-alarm button is hidden
    $id('stop-alarm').classList.add('hidden');
}

var interval = 0;
const startCustomTimerCounter = () => {
    clearInterval(interval);
    paused = !paused;
    $id('timer-control').innerHTML = paused ? '<i class="fas fa-play-circle"></i> Play' : '<i class="fas fa-pause-circle"></i> Pause';
    if (!paused) {
        // Show focus text when timer is running
        $id('focus').classList.remove('hide');
        if (darkTheme) {
            // Apply dark theme styles for active timer
            $('#timer-control').css({ "background": "rgba(255, 107, 53, 0.2)", "color": "#ff6b35" });
        } else {
            // Apply light theme styles for active timer
            $('#timer-control').css({ "background": "rgba(0, 255, 0, 0.1)", "color": "#00ff00" });
        }
    } else {
        // Hide focus text when timer is paused
        $id('focus').classList.add('hide');
        if (darkTheme) {
            // Reset to default dark theme styles when paused
            $('#timer-control').css({ "background": "transparent", "color": "#ff6b35" });
        } else {
            // Reset to default light theme styles when paused
            $('#timer-control').css({ "background": "transparent", "color": "#00ff00" });
        }
    }
    const updateTimer = () => {
        if (!paused && customTime.seconds > 0) {
            customTime.seconds--;
            const hours = Math.floor(customTime.seconds / (60 * 60));
            const minutes = Math.floor(customTime.seconds / 60) % 60;
            const seconds = customTime.seconds % 60;
            
            // Capture padded strings
            const hoursString = String(hours).padStart(2, '0');
            const minutesString = String(minutes).padStart(2, '0');
            const secondsString = String(seconds).padStart(2, '0');

            // Update main page display
            $id('hours').innerHTML = hoursString;
            $id('minutes').innerHTML = minutesString;
            $id('seconds').innerHTML = secondsString;
            
            // --- ADDED FOR PiP ---
            // If the PiP window is open, send it the new time
            if (pipWindow) {
                pipWindow.postMessage({
                    hours: hoursString,
                    minutes: minutesString,
                    seconds: secondsString
                });
            }
            // --- END PiP ---

            updateProgressBar();
            
            // Update document title to show remaining time
            document.title = `${hoursString}:${minutesString}:${secondsString} - Custom Timer`;
            
            // Check if timer is almost complete to prepare for completion
            if (customTime.seconds <= 3) {
                $id('time').style.color = '#ff4757';
            }
        }
        
        if (customTime.seconds < 0) {
            alert("Please Enter a positive time value!");
            reset();
        }
        
        if (customTime.seconds === 0) {
            document.title = "Time's Up! - Custom Timer";
            onTimerComplete();
        }
    }
    interval = setInterval(updateTimer, 1000);
}

function setLightTheme() {
    darkTheme = false;
    
    // Remove dark mode class from body
    $('body').removeClass('dark-mode');
    
    // Navbar styling
    $('.navbar').css({ "background-color": "rgba(255, 255, 255, 0.95)" });
    
    // Title styling
    $('#title1').css({ "color": "#003333" });
    
    // Timer display styling
    $('.timer').css({ "color": "white" });
    $('.active').css({ "background": "linear-gradient(to right, #191654, #43C6AC)" });
    $('.inactive').css({ "background": "rgb(5, 30, 54)" });
    
    // Button styling
    $('.buttons').css({ 
        "border-color": "white",
        "background": "rgba(0, 0, 0, 0.4)",
        "color": "#fefefe"
    });
    
    // Navigation links - always dark
    $('.nav-link').css({ "color": "#003333" });
    
    // Footer styling
    $('.foot').css({ "background": "rgba(255, 255, 255, 0.95)" });
    $('.textfooter').css({ "color": "black" });
    $('.link').css({ "background-color": "#fff", "color": "#000" });
    $('.my-class').css({ "background": "rgba(255, 255, 255, 0.95)" });
    
    // Form styling
    $('.form__field').css({ "color": "#fff", "border-bottom-color": "#9b9b9b" });
    $('.form__label').css({ "color": "#9b9b9b" });
    
    // Progress bar
    $('#progress-container').css({ "background-color": "#ddd" });
    $('#progress-bar').css({ "background": "linear-gradient(90deg, #21f341, #116399)" });
    
    // Set checkbox state
    $('#light').prop("checked", false);
}

function setDarkTheme() {
    darkTheme = true;
    
    // Add dark mode class to body
    $('body').addClass('dark-mode');
    
    // Navbar styling
    $('.navbar').css({ "background-color": "rgba(0, 0, 0, 0.95)" });
    
    // Title styling
    $('#title1').css({ "color": "white" });
    
    // Timer display styling
    $('.timer').css({ "color": "#ff6b35" });
    $('.active').css({ "color": "#ff6b35", "background": "#191212" });
    $('.inactive').css({ "background": "black", "color": "white" });
    
    // Button styling
    $('.buttons').css({ 
        "border-color": "#ff6b35",
        "background": "rgba(255, 107, 53, 0.2)",
        "color": "#ff6b35"
    });
    
    // Navigation links - always dark
    $('.nav-link').css({ "color": "#003333" });
    
    // Footer styling
    $('.foot').css({ "background": "rgba(0, 0, 0, 0.95)" });
    $('.textfooter').css({ "color": "white" });
    $('.link').css({ "background-color": "#ff6b35", "color": "white" });
    $('.my-class').css({ "background": "rgba(0, 0, 0, 0.95)" });
    
    // Form styling
    $('.form__field').css({ "color": "#ff6b35", "border-bottom-color": "#ff6b35" });
    $('.form__label').css({ "color": "#ff6b35" });
    
    // Progress bar
    $('#progress-container').css({ "background-color": "#333" });
    $('#progress-bar').css({ "background": "#ff6b35" });
    
    // Set checkbox state
    $('#light').prop("checked", true);
}

var prefersDarkThemeMql = window.matchMedia("(prefers-color-scheme: dark)");

prefersDarkThemeMql.addEventListener("change", function (mql) {
    if (localStorage.getItem("darkmode") === null && mql.matches) {
        setDarkTheme();
    } else {
        setLightTheme();
    }
})

$(document).ready(function () {
    if (
        localStorage.getItem("darkmode") == "true" ||
        (localStorage.getItem("darkmode") === null && prefersDarkThemeMql.matches)
    ) {
        setDarkTheme();
    }

    $('#light').on("change paste keyup", function (e) {
        if (!e.target.checked) {
            setLightTheme();
            localStorage.setItem("darkmode", false);
        }
        else {
            setDarkTheme();
            localStorage.setItem("darkmode", true);
        }
    });
});

// ============================================
// PICTURE-IN-PICTURE (PiP) WIDGET FUNCTIONS
// ============================================

// Tries to open the PiP widget window
async function openPipWindow() {
    // Return if a window is already open or a request is in progress
    if (pipWindow || pipRequestInProgress) {
        return;
    }
    pipRequestInProgress = true;
    try {
        // 1. Request a BLANK window
        pipWindow = await documentPictureInPicture.requestWindow({
            width: 320,
            height: 120,
        });

        // 2. Add an event listener to know when the user closes it
        pipWindow.addEventListener("pagehide", () => {
            pipWindow = null;
        });

        // 3. Define the HTML and CSS to inject
        // We use Roboto (from Google Fonts) as we can't load the local digital-7.ttf file
        const widgetHTML = `
        <html>
        <head>
            <title>Timer Widget</title>
            <style>
                /* Import Roboto from Google Fonts (this will work) */
                @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap");
                
                body {
                    margin: 0;
                    padding: 10px;
                    background-color: #1a1a1a; /* Dark background */
                    color: #FF8C00; /* Orange color from main page */
                    font-family: 'Roboto', sans-serif; /* Use Roboto */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                }
                #time {
                    font-size: 3.5rem; /* Large font */
                    font-weight: 300; /* Lighter weight */
                    white-space: nowrap;
                }
                #time .txt {
                    font-size: 3rem;
                    margin: 0 0.25rem;
                }
            </style>
        </head>
        <body>
            <div id="time">
                <span class="digit" id="hours">00</span>
                <span class="txt">:</span>
                <span class="digit" id="minutes">00</span>
                <span class="txt">:</span>
                <span class="digit" id="seconds">00</span>
            </div>

            <script>
                window.addEventListener("message", (e) => {
                    if (e.data.hours !== undefined) {
                        document.getElementById('hours').textContent = e.data.hours;
                        document.getElementById('minutes').textContent = e.data.minutes;
                        document.getElementById('seconds').textContent = e.data.seconds;
                    }
                });
            </script>
        </body>
        </html>
        `;

        // 4. Write this HTML into the blank window's document
        pipWindow.document.write(widgetHTML);
        pipWindow.document.close();

    } catch (err) {
        console.error("PiP Error: ", err);
    } finally {
        pipRequestInProgress = false;
    }
}

// Closes the PiP window
function closePipWindow() {
    if (pipWindow) {
        pipWindow.close();
        pipWindow = null;
    }
}

// This function runs every time you switch tabs
function handleVisibilityChange() {
    // If the tab is hidden AND the timer is running...
    if (document.hidden && !paused) {
        openPipWindow(); // ...open the widget
    } 
    // If the tab is visible...
    else {
        closePipWindow(); // ...close the widget
    }
}

// Listen for tab switching
document.addEventListener("visibilitychange", handleVisibilityChange);


// Date display functionality
setInterval(() => {
  var d = new Date();
  var year = d.getFullYear();

  var month;
  switch (d.getMonth()) {
    case 0:
      month = "Jan";
      break;
    case 1:
      month = "Feb";
      break;
    case 2:
      month = "Mar";
      break;
    case 3:
      month = "Apr";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "Jun";
      break;
    case 6:
      month = "Jul";
      break;
    case 7:
      month = "Aug";
      break;
    case 8:
      month = "Sep";
      break;
    case 9:
      month = "Oct";
      break;
    case 10:
      month = "Nov";
      break;
    case 11:
      month = "Dec";
      break;
  }

  var dayn = d.getDate();
  var dateStr = dayn + " " + month + " , " + year;

  if ($id("d1")) $id("d1").innerHTML = dateStr;
}, 1000);

// Add event listeners for Enter key in input fields
document.addEventListener('DOMContentLoaded', function() {
  const inputs = ['hoursInput', 'minutesInput', 'secondsInput'];
  
  inputs.forEach(id => {
    $id(id).addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        setCustomTime(
          $id('hoursInput').value,
          $id('minutesInput').value,
          $id('secondsInput').value
        );
      }
    });
  });
});