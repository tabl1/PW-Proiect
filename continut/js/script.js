var interval;
function initialize() {
    functie();
    drawCanvas();
}
document.addEventListener("DOMContentLoaded", stergeLocalStorage);

function stopInterval() {
    clearInterval(interval);
}

function functie() {
    window.navigator.geolocation.getCurrentPosition(showPosition);
    drawCanvas();
    document.getElementById("p4").innerText = "Browser: " + window.navigator.userAgent;
    document.getElementById("p5").innerText = "Sistem De Operare: " + window.navigator.platform;
    interval = setInterval(getTimeData,100); 
}

function getTimeData(){
    var Data = new Date();
    document.getElementById("p1").innerText = "Data si timp: " +
        Data.getDate() + "." + (Data.getMonth() + 1) + "." + Data.getFullYear() + " / " +
        Data.getHours() + ":" + Data.getMinutes() + ":" + Data.getSeconds();
    document.getElementById("p2").innerText = "URL: " + window.location.href;
}

function showPosition(position) {
    document.getElementById("p3").innerText = "Locatie Curenta: " +
        "Latitude: " + position.coords.latitude + " / " +
        "Longitude: " + position.coords.longitude;
}

function drawCanvas() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    var isDrawing = false;
    var startX, startY;

    canvas.addEventListener("mousedown", function (e) {
        isDrawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (!isDrawing) return;

        var width = e.offsetX - startX;
        var height = e.offsetY - startY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = document.getElementById("contur").value;
        ctx.fillStyle = document.getElementById("umplere").value;
        ctx.beginPath();
        ctx.rect(startX, startY, width, height);
        ctx.stroke();
        ctx.fill();
    });

    canvas.addEventListener("mouseup", function (e) {
        isDrawing = false;
    });
}

function insertRow() {
    var table = document.getElementById("myTable");
    var rowPosition = document.getElementById("rowPosition").value;
    var color = document.getElementById("colorPicker").value;

    if (!rowPosition || isNaN(rowPosition)) {
        alert("Introduceți o poziție validă pentru linie.");
        return;
    }

    // daca exista deja
    if (table.rows[rowPosition - 1]) {
        alert("Linia " + rowPosition + " există deja.");
        return;
    }

    var row = table.insertRow(rowPosition - 1);
    for (var i = 0; i < table.rows[0].cells.length; i++) {
        var cell = row.insertCell(i);
        cell.innerHTML = "Linie " + rowPosition + ", Coloana " + (i + 1);
        cell.style.backgroundColor = color;
    }
}

function insertColumn() {
    var table = document.getElementById("myTable");
    var columnPosition = document.getElementById("columnPosition").value;
    var color = document.getElementById("colorPicker").value;

    if (!columnPosition || isNaN(columnPosition)) {
        alert("Introduceți o poziție validă pentru coloană.");
        return;
    }

    // daca exista deja
    for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].cells[columnPosition - 1]) {
            alert("Coloana " + columnPosition + " există deja.");
            return;
        }
    }

    for (var i = 0; i < table.rows.length; i++) {
        var cell = table.rows[i].insertCell(columnPosition - 1);
        cell.innerHTML = "Linie " + (i + 1) + ", Coloana " + columnPosition;
        cell.style.backgroundColor = color;
    }

}

/////lab7
function schimbaContinut(resursa,jsFisier,jsFunctie)
{
    stopInterval();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("continut").innerHTML = this.responseText;
            if (jsFisier) {
                var elementScript = document.createElement('script');
                elementScript.onload = function () {
                console.log("hello");
                if (jsFunctie) {
                    window[jsFunctie]();
                }
                };
                elementScript.src = jsFisier;
                document.head.appendChild(elementScript);
               } else {
                if (jsFunctie) {
                window[jsFunctie]();
                }
               } 
        }
    };
    xhttp.open("GET", resursa + ".html",true);
    xhttp.send();
}

function validateForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var result = document.getElementById("result");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var utilizatori = JSON.parse(xhr.responseText);
                var isValid = false;
                utilizatori.forEach(user => {
                    if (user.utilizator === username && user.parola === password) {
                        isValid = true;
                    }
                });
                if (isValid) {
                    result.textContent = "Utilizator și parolă corecte!";
                } else {
                    result.textContent = "Utilizator sau parolă incorecte!";
                }
            } else {
                console.error('Eroare la încărcarea utilizatorilor:', xhr.status);
                result.textContent = "Eroare la încărcarea utilizatorilor.";
            }
        }
    };

    xhr.open("GET", "resurse/utilizatori.json", true);
    xhr.send();
}

if(document.getElementById('formular')){
    document.getElementById('formular').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevenim trimiterea formularului

        // Obținem datele din formular
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var nume = document.getElementById('nume').value;
        var prenume = document.getElementById('prenume').value;
        var email = document.getElementById('email').value;
        var telefon = document.getElementById('telefon').value;

        // Creăm obiectul JSON cu datele formularului
        var jsonData = {
            "utilizator": username,
            "parola": password,
            "nume": nume,
            "prenume": prenume,
            "email": email,
            "telefon": telefon
        };

         // Trimitem cererea POST către server
         var url = 'url_server'; // Schimbă 'url_server' cu URL-ul serverului tău
         var xhr = new XMLHttpRequest();
         xhr.open('POST', url, true);
         xhr.setRequestHeader('Content-Type', 'application/json');
         xhr.onload = function() {
             if (xhr.status === 200) {
                 console.log('Cererea a fost trimisă cu succes!');
                 
             } else {
                 console.error('Eroare la trimiterea cererii:', xhr.statusText);
                 
             }
         };
         xhr.send(JSON.stringify(jsonData));
    });
}

//lab 8
function stergeLocalStorage() {
    localStorage.clear();
}


