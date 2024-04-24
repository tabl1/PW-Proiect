// Ascultă evenimentul de la scriptul principal
self.addEventListener('message', function(event) {
    console.log('Web Worker a primit notificare de la scriptul principal:', event.data);

    // Trimite un mesaj înapoi către scriptul principal
    self.postMessage('Web Worker a primit notificare și a procesat acțiunea.');
});