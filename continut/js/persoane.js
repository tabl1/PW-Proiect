function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        myFunction(this);
      }
    };
    xhttp.open("GET", "/resurse/persoane.xml", true);
    xhttp.send();
  }
  
  function myFunction(xml) {
    var i;
    var xmlDoc = xml.responseXML;
    var table="<tr><th>Nume</th><th>Prenume</th></tr>";
    var x = xmlDoc.getElementsByTagName("persoana");
    for (i = 0; i <x.length; i++) {
      table += "<tr><td>" +
      x[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue +
      "</td><td>" +
      x[i].getElementsByTagName("prenume")[0].childNodes[0].nodeValue +
      "</td></tr>";
    }
    
     // Crearea unui element tabelă
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<table>' + table + '</table>';
    var tableElement = tempDiv.firstChild;
    var paragraph = document.getElementById("p");
    var parent = paragraph.parentNode;
    parent.replaceChild(tableElement, paragraph);
  }
