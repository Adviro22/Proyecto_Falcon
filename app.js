import express from "express";
import { auth } from "./auth.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import connection, { dbConfig } from "./db.js";
import bodyParser from "body-parser";
import bcryptjs from "bcryptjs";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static("public"));

app.use(express.static(path.join(__dirname, "public/HTML")));

// Configura EJS como motor de plantillas
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "public/EJS"));

app.use(
  cookieSession({
    name: "session",
    keys: ["tu_clave_secreta_aqui"],
    maxAge: 24 * 60 * 60 * 1000, // Tiempo de vida de la sesión en milisegundos (1 día en este caso)
  })
);

app.use(express.urlencoded({ extended: true }));

app.get("/", auth, function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/index.html");
  res.sendFile(indexPath);
});

app.get("/perfil-usuario", (req, res) => {
  if (!req.session.username) {
    res.redirect("/login");
    return;
  }

  res.render("Perfil", { username: req.session.username.username });
});

app.get("/subir-archivos", auth, function (req, res) {
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

//AUTENTIFICACION
// Dentro de tu ruta de autenticación ("/auth")
app.post("/auth", async (req, res) => {
  const user = req.body.username;
  const pass = req.body.password;
  if (user && pass) {
    connection.query(
      "SELECT * FROM User WHERE username = ?",
      [user],
      async (error, results) => {
        if (results.length === 0) {
          // Redirige al usuario a la página de inicio de sesión (archivo HTML)
          res.sendFile(path.join(__dirname, "public/HTML/login.html"));
        } else {
          const isPasswordValid = await bcryptjs.compare(
            pass,
            results[0].password
          );

          if (isPasswordValid) {
            const userInfo = {
              id: results[0].id,
              username: results[0].username,
            };

            req.session.username = userInfo;
            req.session.loggedin = true;

            // Redirige al usuario a la página de perfil después del inicio de sesión
            res.redirect("/perfil-usuario");
          } else {
            // Autenticación fallida, redirige a la página de inicio de sesión con una query string
            res.redirect("/login?error=true");
          }
        }
      }
    );
  } else {
    res.send("Por favor ingrese un usuario y contraseña");
  }
});

//Registro de Usuarios
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const pass = req.body.password;
  let passwordHaash = await bcryptjs.hash(pass, 8);
  connection.query(
    "INSERT INTO User SET ?",
    { username: username, password: passwordHaash },
    async (error, results) => {
      if (error) {
        console.log(error);
      } else {
        res.send("REGISTRO EXITOSO");
      }
    }
  );
});

// La ruta de cierre de sesión
app.get("/logout", function (req, res) {
  req.session = null; // Destruye la sesión eliminándola
  res.redirect("/"); // Redirige al inicio u otra página después de cerrar sesión
});

// PETICIONES DEL PROYECTO

app.listen(PORT, function () {
  console.log(`Servidor en:  http://localhost:${PORT}`);
});
