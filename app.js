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

app.use(bodyParser.json());

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

app.get("/perfil-usuario", auth, (req, res) => {
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

app.get("/mostrar-datos", function (req, res) {
  // Utiliza el método `join` del módulo `path` para construir rutas de forma segura
  const indexPath = path.join(__dirname, "public", "/HTML/mostrar_datos.html");
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

app.post('/registrar', (req, res) => {
  const data = req.body;

  // Primera consulta: Insertar en Poliza
  const queryPoliza = `
    INSERT INTO Poliza (estadoPoliza, numeroPoliza, fechaInicio, fechaFinalizacion)
    VALUES ('${req.body.estadoPoliza}', '${req.body.numeroPoliza}', '${req.body.fechaInicio}', '${req.body.fechaFinalizacion}');
  `;

  connection.query(queryPoliza, (err, resultPoliza) => {
    if (err) {
      console.error('Error al insertar en Poliza:', err);
      res.status(500).send('Error interno del servidor');
    } else {
      // Obtener el ID de la póliza recién insertada
      const polizaId = resultPoliza.insertId;

      // Segunda consulta: Insertar en Propietario
      const queryPropietario = `
        INSERT INTO Propietario (idPoliza, nombreCompleto, correoElectronico, telefono, direccionPostal, direccionGaraje)
        VALUES (${polizaId}, '${req.body.nombreCompleto}', '${req.body.correoElectronico}', '${req.body.telefono}', '${req.body.direccionPostal}', '${req.body.direccionGaraje}');
      `;

      connection.query(queryPropietario, (err, resultPropietario) => {
        if (err) {
          console.error('Error al insertar en Propietario:', err);
          res.status(500).send('Error interno del servidor');
        } else {
          // Tercera consulta: Insertar en Conductores (Conductor 1)
          const queryConductor1 = `
            INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
            VALUES (${polizaId}, '${req.body.nombreConductor1}', '${req.body.relacionConductor1}', '${req.body.fechaNacimientoConductor1}', '${req.body.generoConductor1}');
          `;

          connection.query(queryConductor1, (err, resultConductor1) => {
            if (err) {
              console.error('Error al insertar en Conductor 1:', err);
              res.status(500).send('Error interno del servidor');
            } else {
              // Cuarta consulta: Insertar en Vehiculos
              const queryVehiculo = `
                INSERT INTO Vehiculos (idPoliza, anoVehiculo, marcaVehiculo, modeloVehiculo, vinVehiculo, tipoCuerpoVehiculo, arrendamientoVehiculo)
                VALUES (${polizaId}, ${req.body.anoVehiculo}, '${req.body.marcaVehiculo}', '${req.body.modeloVehiculo}', '${req.body.vinVehiculo}', '${req.body.tipoCuerpoVehiculo}', '${req.body.arrendamientoVehiculo}');
              `;

              connection.query(queryVehiculo, (err, resultVehiculo) => {
                if (err) {
                  console.error('Error al insertar en Vehiculo:', err);
                  res.status(500).send('Error interno del servidor');
                } else {
                  // Quinta consulta: Insertar en Facturacion
                  const queryFacturacion = `
                    INSERT INTO Facturacion (idPoliza, cantidadFacturacion, fechaFacturacion)
                    VALUES (${polizaId}, ${req.body.cantidadFacturacion}, '${req.body.fechaFacturacion}');
                  `;

                  connection.query(queryFacturacion, (err, resultFacturacion) => {
                    if (err) {
                      console.error('Error al insertar en Facturacion:', err);
                      res.status(500).send('Error interno del servidor');
                    } else {
                      // Verificar si se proporcionaron datos para el segundo conductor
                      if (req.body.nombreConductor2) {
                        // Sexta consulta: Insertar en Conductores (Conductor 2)
                        const queryConductor2 = `
                          INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
                          VALUES (${polizaId}, '${req.body.nombreConductor2}', '${req.body.relacionConductor2}', '${req.body.fechaNacimientoConductor2}', '${req.body.generoConductor2}');
                        `;

                        connection.query(queryConductor2, (err, resultConductor2) => {
                          if (err) {
                            console.error('Error al insertar en Conductor 2:', err);
                            res.status(500).send('Error interno del servidor');
                          } else {
                            // Verificar si se proporcionaron datos para el tercer conductor
                            if (req.body.nombreConductor3) {
                              // Séptima consulta: Insertar en Conductores (Conductor 3)
                              const queryConductor3 = `
                                INSERT INTO Conductores (idPoliza, nombreConductor, relacionConductor, fechaNacimientoConductor, generoConductor)
                                VALUES (${polizaId}, '${req.body.nombreConductor3}', '${req.body.relacionConductor3}', '${req.body.fechaNacimientoConductor3}', '${req.body.generoConductor3}');
                              `;

                              connection.query(queryConductor3, (err, resultConductor3) => {
                                if (err) {
                                  console.error('Error al insertar en Conductor 3:', err);
                                  res.status(500).send('Error interno del servidor');
                                } else {
                                  console.log('Datos registrados con éxito en la base de datos');
                                  res.status(200).send('Datos registrados con éxito');
                                }
                              });
                            } else {
                              console.log('Datos registrados con éxito en la base de datos');
                              res.status(200).send('Datos registrados con éxito');
                            }
                          }
                        });
                      } else {
                        console.log('Datos registrados con éxito en la base de datos');
                        res.status(200).send('Datos registrados con éxito');
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
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
