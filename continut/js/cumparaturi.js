let webWorker = new Worker('js/worker.js');

function Produs(id, nume, cantitate) {
    this.id = id;
    this.nume = nume;
    this.cantitate = cantitate;
}

// Funcția pentru salvarea produsului în localStorage
function salvareProdusLocalStorage(produs) {
    return new Promise(function(resolve, reject) {
        let produse = JSON.parse(localStorage.getItem('produse')) || [];
        produse.push(produs);
        localStorage.setItem('produse', JSON.stringify(produse));
        resolve();
    });
}

// Funcția pentru afișarea produsului adăugat în listă
function afisareProdusAdaugat(produs) {
    const listaProduse = document.getElementById('lista-produse');

    // Verificăm dacă listaProduse există înainte de a încerca să adăugăm un element în ea
    if (listaProduse) {
        const produsElement = document.createElement('p');
        produsElement.textContent = `${produs.cantitate} x ${produs.nume}`;

        listaProduse.appendChild(produsElement);
    } else {
        console.error('Elementul cu id-ul "lista-produse" nu a fost găsit.');
    }
}

// Funcția de adăugare a unui produs în lista de cumpărături
function adaugaProdus() {
    const numeInput = document.getElementById('nume').value;
    const cantitateInput = parseInt(document.getElementById('cantitate').value);

    if (!numeInput || isNaN(cantitateInput) || cantitateInput <= 0) {
        alert('Introduceți un nume și o cantitate validă!');
        return;
    }

    const produsNou = new Produs(Date.now(), numeInput, cantitateInput);
    // Salvăm produsul în localStorage
    salvareProdusLocalStorage(produsNou)
        .then(function() {
            // Produsul a fost salvat cu succes
            //afisareProdusAdaugat(produsNou);(Pentru tema 1)
            // Trimitem un mesaj către Web Worker
            webWorker.postMessage('Produs adăugat');
        })
        .catch(function(error) {
            console.error('Eroare la salvarea produsului:', error);
        });
}

// Ascultăm mesajele primite de la Web Worker
webWorker.addEventListener('message', function(event) {
    console.log('Mesaj de la Web Worker:', event.data);
    // Apelăm funcția pentru adăugarea unei linii în tabel
    adaugaLinieTabel();
});

// Funcția pentru adăugarea unei linii în tabelul cu lista de cumpărături
function adaugaLinieTabel() {
    const produse = JSON.parse(localStorage.getItem('produse')) || [];
    const tabel = document.getElementById('tabel-cumparaturi');
    if (tabel) {
        tabel.innerHTML="";
        const rand = tabel.insertRow();
        const celulaNr = rand.insertCell(0);
        const celulaNume = rand.insertCell(1);
        const celulaCantitate = rand.insertCell(2);
        celulaNr.textContent = "Număr";
        celulaNume.textContent = "Nume Produs";
        celulaCantitate.textContent = "Cantitate";

        // Iterăm prin produse și adăugăm fiecare în tabel
        produse.forEach(function(produs, index) {
            if(index < 16){
                const rand = tabel.insertRow();
                const celulaNr = rand.insertCell(0);
                const celulaNume = rand.insertCell(1);
                const celulaCantitate = rand.insertCell(2);

                celulaNr.textContent = index+1;
                celulaNume.textContent = produs.nume;
                celulaCantitate.textContent = produs.cantitate;
            }
        });
    } else {
        console.error('Tabelul cu id-ul "tabel-cumparaturi" nu a fost găsit.');
    }
}




