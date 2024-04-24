import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPOutputStream;
import java.util.List;
import java.net.URLDecoder;

public class ServerWeb {
    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();

    static {
        CONTENT_TYPES.put("html", "text/html; charset=UTF-8");
        CONTENT_TYPES.put("css", "text/css; charset=UTF-8");
        CONTENT_TYPES.put("js", "application/js; charset=UTF-8");
        CONTENT_TYPES.put("png", "image/png");
        CONTENT_TYPES.put("jpg", "image/jpeg");
        CONTENT_TYPES.put("jpeg", "image/jpeg");
        CONTENT_TYPES.put("gif", "image/gif");
        CONTENT_TYPES.put("ico", "image/x-icon");
        CONTENT_TYPES.put("json","application/json");
        CONTENT_TYPES.put("xml","application/xml");
    }

    public static void main(String[] args) throws IOException {
        System.out.println("Serverul asculta potentiali clienti.");

        // pornește un server pe portul 5678
        ServerSocket serverSocket = new ServerSocket(5678);

        while (true) {
            // asteapta conectarea unui client la server
            // metoda accept este blocanta
            // clientSocket - socket-ul clientului conectat
            Socket clientSocket = serverSocket.accept();
            System.out.println("S-a conectat un client.");

            // creeaza un nou thread pentru a procesa clientul
            Thread clientThread = new Thread(new ClientHandler(clientSocket));
            clientThread.start();
        }
    }

    private static class ClientHandler implements Runnable {
        private final Socket clientSocket;

        ClientHandler(Socket socket) {
            this.clientSocket = socket;
        }

        @Override
        public void run() {
            try (
                BufferedReader socketReader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream(), StandardCharsets.UTF_8));
                OutputStream outputStream = clientSocket.getOutputStream();
            ) {
                // este citita prima linie de text din cerere
                String linieDeStart = socketReader.readLine();
                System.out.println("S-a citit linia de start din cerere: ##### " + linieDeStart + " #####");

                // interpretarea sirului de caractere `linieDeStart` pentru a
                // extrage numele resursei cerute
                String[] numeResursa = linieDeStart.split(" ");
                String mesaj = "";
                if ("POST".equals(numeResursa[0]) && "/api/utilizatori".equals(numeResursa[1])) {
                    String linie;
                    System.out.println("Incepe citirea corpului cererii...");
                    while ((linie = socketReader.readLine()) != null && !linie.isEmpty()) {
                        System.out.println(linie);  // Aici afisam capurile de cerere, pentru diagnosticare
                    }
                    StringBuilder requestBody = new StringBuilder();
                    System.out.println("Incepe citirea datelor din corpul cererii...");
                    while ((linie = socketReader.readLine()) != null && !linie.isEmpty()) {
                        System.out.println("Linie citita: " + linie);  // Afisam fiecare linie citita pentru diagnosticare
                        requestBody.append(linie).append("\r\n");
                    }
                    System.out.println("S-a terminat de citit corpul cererii.");

                    // Convertim corpul cererii într-un obiect JSON
                    String jsonData = requestBody.toString();
                    System.out.println("JSON primit: " + jsonData);

                    // Adaugam JSON-ul primit în fisierul utilizatori.json
                    System.out.println("Incepe adaugarea utilizatorului in fisierul JSON...");
                    boolean adaugat = adaugaUtilizator(jsonData);

                    if (adaugat) {
                        mesaj = "Utilizator adaugat cu succes!";
                    } else {
                        mesaj = "Eroare la adaugarea utilizatorului.";
                    }

                    String raspuns = "HTTP/1.1 302 Found\r\n" +
                            "Location: /index.html\r\n" + 
                            "Server: MySimpleServer\r\n" +
                            "\r\n";

                    outputStream.write(raspuns.getBytes(StandardCharsets.UTF_8));
                    outputStream.flush(); // flush the output stream
                    System.out.println("Raspuns trimis pentru POST /api/utilizatori");

                    clientSocket.close();
                    System.out.println("S-a terminat comunicarea cu clientul.");
                } else {
                    if (numeResursa.length >= 2) {
                        String numeFisier = numeResursa[1].substring(1);
                        numeFisier = "C:/Users/EU/Desktop/PW/proiect-1-tabl1/continut/" + numeFisier;
                        Path filePath = Paths.get(numeFisier);
                        if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                            byte[] continutFisier = Files.readAllBytes(filePath);
                            String extensie = getFileExtension(numeFisier);
                            System.out.println(extensie);
                            String contentType = CONTENT_TYPES.getOrDefault(extensie, "text/plain; charset=UTF-8");
                            String contentLength = String.valueOf(continutFisier.length);

                           
                            boolean acceptGzip = linieDeStart.contains("gzip");

                            // trimiterea raspunsului HTTP
                            String header = "HTTP/1.1 200 OK\r\n" +
                                    "Content-Type: " + contentType + "\r\n" +
                                    "Content-Length: " + contentLength + "\r\n" +
                                    "Server: MySimpleServer\r\n";

                            if (acceptGzip) {
                                header += "Content-Encoding: gzip\r\n";
                                ByteArrayOutputStream gzipBuffer = new ByteArrayOutputStream();
                                try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(gzipBuffer)) {
                                    gzipOutputStream.write(continutFisier);
                                }
                                outputStream.write(header.getBytes(StandardCharsets.UTF_8));
                                outputStream.write(gzipBuffer.toByteArray());
                            } else {
                                header += "\r\n";
                                outputStream.write(header.getBytes(StandardCharsets.UTF_8));
                                outputStream.write(continutFisier);
                            }
                            outputStream.flush();

                            System.out.println("Raspuns trimis pentru " + numeFisier);
                        } else {
                            mesaj = "404 Not Found";
                            String raspuns = "HTTP/1.1 404 Not Found\r\n" +
                                    "Content-Type: text/plain; charset=UTF-8\r\n" +
                                    "Content-Length: " + mesaj.length() + "\r\n" +
                                    "Server: MySimpleServer\r\n" +
                                    "\r\n" + mesaj;
                            outputStream.write(raspuns.getBytes(StandardCharsets.UTF_8));
                            outputStream.flush(); // flush the output stream
                        }
                    }
                }

                
                clientSocket.close();
                System.out.println("S-a terminat comunicarea cu clientul.");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return fileName.substring(lastDotIndex + 1);
        }
        return "";
    }

    private static boolean adaugaUtilizator(String jsonData) {
        // Calea catre fisierul utilizatori.json
        String caleFisier = "C:/Users/EU/Desktop/PW/proiect-1-tabl1/continut/resurse/utilizatori.json";
    
        try {
            // Citim continutul actual al fisierului utilizatori.json
            Path filePath = Paths.get(caleFisier);
            List<String> lines = Files.readAllLines(filePath, StandardCharsets.UTF_8);
    
            // Verificam daca fisierul este gol sau contine deja un JSON
            boolean existaJson = false;
            String ultimaLinie="";
            if (!lines.isEmpty()) {
                ultimaLinie = lines.get(lines.size() - 1);
                if (ultimaLinie.endsWith("]") || ultimaLinie.startsWith("[")) {
                    existaJson = true;
                    ultimaLinie = ultimaLinie.substring(0, ultimaLinie.length() - 1); 
                    lines.set(0,ultimaLinie);
                }
            }
    
            // Extragem campurile "username" si "password" din JSON-ul primit
            String[] parts = jsonData.split("&");
            String username = "";
            String password = "";
            for (String part : parts) {
                String[] keyValue = part.split("=");
                if (keyValue.length == 2) {
                    String key = keyValue[0];
                    String value = URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
                    if (key.equals("username")) {
                        username = value;
                    } else if (key.equals("password")) {
                        password = value;
                    }
                }
            }
            
            // Adaugam virgula intre obiectele JSON (daca nu e primul)
            if (existaJson) {
                ultimaLinie += (",");
                lines.set(0,ultimaLinie);
            } else {
                // Daca nu exista JSON, incepem un nou array JSON
                ultimaLinie += ("[");
                lines.set(0,ultimaLinie);
            }

            // Formam un nou obiect JSON cu chei definite pentru "utilizator" si "parola"
            StringBuilder utilizatorJson = new StringBuilder();
            utilizatorJson.append("{");
            utilizatorJson.append("\"utilizator\": \"").append(username).append("\", ");
            utilizatorJson.append("\"parola\": \"").append(password).append("\"");
            utilizatorJson.append("}");
    
            // Adaugam obiectul JSON al utilizatorului in lista
            ultimaLinie += utilizatorJson.toString();
    
            // Adaugam inchiderea array-ului JSON
            ultimaLinie += ("]");
            lines.set(0,ultimaLinie);
    
            // Scriem noul continut in fisier
            Files.write(filePath, lines, StandardCharsets.UTF_8);
    
            return true; // Succes la adaugare
        } catch (IOException e) {
            e.printStackTrace();
            return false; // Eroare la adaugare
        }
    }
    
}
    

