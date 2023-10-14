import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import dotenv from "dotenv"
import connection, { dbConfig } from "./db.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static("public"));

// VISTAS DEL PROYECTO
app.get("/", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/index.html");
  res.sendFile(indexPath);
});

app.get("/subir-archivos", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/subir_archivos.html");
  res.sendFile(indexPath);
});

app.get("/visor-pdf", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/visor_pdf.html");
  res.sendFile(indexPath);
});

app.get("/register", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/register.html");
  res.sendFile(indexPath);
});

app.get("/login", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/login.html");
  res.sendFile(indexPath);
});

// PETICIONES DEL PROYECTO

app.listen(PORT, function () {
  console.log(`Servidor en:  http://localhost:${PORT}`);
});
