const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const cache = {}; // obiekt do przechowywania buforowanych plików

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plan' });
  res.write('Error 404: plik nie został znaleziony');
  res.end();
}

function sendFile(res, filePath, fileContents) {
  res.writeHead(200, {
    'Content-Type': mime.lookup(path.basename(filePath)),
  });
  res.end(fileContents);
}

function serveStatic(res, cache, absPath) {
  // Sprawdzenie, czy plik jest buforowany w pamięci
  if (cache[absPath]) {
    sendFile(res, absPath, cache[absPath]); // Udostępnienie pliku z pamięci
  } else {
    fs.exists(absPath, function(exists) {
      // Sprawdzenie, czy plik istnieje
      if (exists) {
        fs.readFile(absPath, function(err, data) {
          // Odczyt pliku dysku
          if (err) {
            send404(res);
          } else {
            cache[absPath] = data;
            sendFile(res, absPath, data); // Udostępnienie pliku odczytanego z dysku
          }
        });
      } else {
        send404(res); // Wysłanie odpowiedzi HTTP 404
      }
    });
  }
}

const server = http.createServer(function(req, res) {
  // Utworzenie serwera HTTP za pomocą funkcji anonimowej definiującej
  // zachowanie w poszczególnych żądaniach
  let filePath = false;

  if (req.url === '/') {
    // Wskazanie pliku HTML, który ma być domyślnie udostępniony
    filePath = 'public/index.html';
  } else {
    // Zmiana adresu URL na względną ścieżkę dostępu do pliku
    filePath = 'public' + req.url;
  }
  // Udostępnianie pliku statycznego
  let absPath = './' + filePath;
  serveStatic(res, cache, absPath);
});




