const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

let db;


// ==========================================
// CONFIGURACIÓN
// ==========================================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);


// ==========================================
// BASE DE DATOS
// ==========================================

async function iniciarBaseDatos() {

    db = await open({
        filename: "./data/sistema2.db",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            mfa_secret TEXT,
            mfa_activado INTEGER DEFAULT 0,
            activo INTEGER DEFAULT 1
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descripcion TEXT,
            usuario_id INTEGER,
            estado TEXT DEFAULT 'ABIERTO'
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS auditoria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha TEXT NOT NULL,
            usuario TEXT,
            accion TEXT NOT NULL,
            resultado TEXT NOT NULL,
            ip TEXT,
            hash_anterior TEXT,
            hash_actual TEXT NOT NULL
        )
    `);

    console.log("Base de datos inicializada.");
}


// ==========================================
// AUDITORÍA
// ==========================================

async function registrarAuditoria(
    usuario,
    accion,
    resultado,
    ip
) {

    const ultimo = await db.get(`
        SELECT *
        FROM auditoria
        ORDER BY id DESC
        LIMIT 1
    `);

    const hashAnterior = ultimo
        ? ultimo.hash_actual
        : "0";

    const fecha = new Date().toISOString();

    const datos =
        usuario +
        accion +
        resultado +
        ip +
        fecha +
        hashAnterior;

    const hashActual = crypto
        .createHash("sha256")
        .update(datos)
        .digest("hex");

    await db.run(`
        INSERT INTO auditoria (
            fecha,
            usuario,
            accion,
            resultado,
            ip,
            hash_anterior,
            hash_actual
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
        fecha,
        usuario,
        accion,
        resultado,
        ip,
        hashAnterior,
        hashActual
    );
}


// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1">

            <title>Sistema 2</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">

        </head>

        <body class="bg-light">

            <nav class="navbar navbar-dark bg-dark">

                <div class="container">

                    <span class="navbar-brand">
                        Sistema Seguro 2
                    </span>

                </div>

            </nav>

            <div class="container mt-5">

                <div class="card shadow">

                    <div class="card-body text-center">

                        <h1>
                            Sistema 2
                        </h1>

                        <h4 class="text-muted">
                            Node.js + Express
                        </h4>

                        <hr>

                        <p>
                            Sistema de gestión de tickets
                        </p>

                        <a
                            href="/login"
                            class="btn btn-success">

                            Iniciar sesión

                        </a>

                        <a
                            href="/registro"
                            class="btn btn-primary">

                            Registrarse

                        </a>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);

});


// ==========================================
// REGISTRO
// ==========================================

app.get("/registro", (req, res) => {

    res.send(`
        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1">

            <title>Registro</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">

        </head>

        <body class="bg-light">

            <div class="container mt-5">

                <div class="row justify-content-center">

                    <div class="col-md-5">

                        <div class="card shadow">

                            <div class="card-body">

                                <h2 class="text-center mb-4">
                                    Crear usuario
                                </h2>

                                <form
                                    method="POST"
                                    action="/registro">

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Usuario
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            class="form-control"
                                            required>

                                    </div>

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Contraseña
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            class="form-control"
                                            required>

                                    </div>

                                    <button
                                        class="btn btn-primary w-100"
                                        type="submit">

                                        Registrarse

                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);

});


app.post("/registro", async (req, res) => {

    const {
        username,
        password
    } = req.body;

    const existente = await db.get(
        "SELECT * FROM usuarios WHERE username = ?",
        username
    );

    if (existente) {

        return res.send(
            "El usuario ya existe."
        );
    }

    const passwordHash =
        await bcrypt.hash(
            password,
            12
        );

    await db.run(`
        INSERT INTO usuarios (
            username,
            password_hash
        )
        VALUES (?, ?)
    `,
        username,
        passwordHash
    );

    await registrarAuditoria(
        username,
        "REGISTRO",
        "OK",
        req.ip
    );

    res.redirect("/login");
});


// ==========================================
// LOGIN
// ==========================================

app.get("/login", (req, res) => {

    res.send(`
        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1">

            <title>Login</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">

        </head>

        <body class="bg-light">

            <div class="container mt-5">

                <div class="row justify-content-center">

                    <div class="col-md-5">

                        <div class="card shadow">

                            <div class="card-body">

                                <h2 class="text-center mb-4">
                                    Iniciar sesión
                                </h2>

                                <form
                                    method="POST"
                                    action="/login">

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Usuario
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            class="form-control"
                                            required>

                                    </div>

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Contraseña
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            class="form-control"
                                            required>

                                    </div>

                                    <button
                                        type="submit"
                                        class="btn btn-success w-100">

                                        Ingresar

                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);

});


app.post("/login", async (req, res) => {

    const {
        username,
        password
    } = req.body;

    const usuario = await db.get(
        "SELECT * FROM usuarios WHERE username = ?",
        username
    );

    if (!usuario) {

        await registrarAuditoria(
            username,
            "LOGIN_WEB",
            "FALLIDO",
            req.ip
        );

        return res.send(
            "Usuario o contraseña incorrectos."
        );
    }

    const correcta =
        await bcrypt.compare(
            password,
            usuario.password_hash
        );

    if (!correcta) {

        await registrarAuditoria(
            username,
            "LOGIN_WEB",
            "FALLIDO",
            req.ip
        );

        return res.send(
            "Usuario o contraseña incorrectos."
        );
    }

    await registrarAuditoria(
        usuario.username,
        "LOGIN_WEB",
        "OK",
        req.ip
    );

    req.session.usuarioMfaId =
        usuario.id;

    res.redirect("/configurar-mfa");
});

// ==========================================
// CONFIGURAR MFA
// ==========================================

app.get("/configurar-mfa", async (req, res) => {

    const usuarioId = req.session.usuarioMfaId;

    if (!usuarioId) {
        return res.redirect("/login");
    }

    const usuario = await db.get(
        "SELECT * FROM usuarios WHERE id = ?",
        usuarioId
    );

    if (!usuario) {
        return res.redirect("/login");
    }

    let secret = usuario.mfa_secret;

    if (!secret) {

        const generado = speakeasy.generateSecret({
            name: `Sistema Seguro 2 (${usuario.username})`
        });

        secret = generado.base32;

        await db.run(
            "UPDATE usuarios SET mfa_secret = ? WHERE id = ?",
            secret,
            usuario.id
        );
    }

    const otpauth = speakeasy.otpauthURL({
        secret: secret,
        label: usuario.username,
        issuer: "Sistema Seguro 2",
        encoding: "base32"
    });

    const qr = await QRCode.toDataURL(otpauth);

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>MFA</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">
        </head>

        <body class="bg-light">

            <div class="container mt-5">

                <div class="row justify-content-center">

                    <div class="col-md-5">

                        <div class="card shadow">

                            <div class="card-body text-center">

                                <h2>Autenticación MFA</h2>

                                <p>
                                    Escaneá el código QR con Google Authenticator
                                    o Microsoft Authenticator.
                                </p>

                                <img
                                    src="${qr}"
                                    class="img-fluid mb-3"
                                    alt="QR MFA">

                                <p>
                                    Luego ingresá el código de 6 dígitos.
                                </p>

                                <form method="POST" action="/verificar-mfa">

                                    <input
                                        type="text"
                                        name="codigo"
                                        class="form-control mb-3"
                                        maxlength="6"
                                        required>

                                    <button
                                        type="submit"
                                        class="btn btn-success w-100">

                                        Verificar

                                    </button>

                                </form>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);
});
// ==========================================
// VERIFICAR MFA
// ==========================================

app.post("/verificar-mfa", async (req, res) => {

    const usuarioId = req.session.usuarioMfaId;

    if (!usuarioId) {
        return res.redirect("/login");
    }

    const usuario = await db.get(
        "SELECT * FROM usuarios WHERE id = ?",
        usuarioId
    );

    const codigo = req.body.codigo;

    const valido = speakeasy.totp.verify({
        secret: usuario.mfa_secret,
        encoding: "base32",
        token: codigo,
        window: 1
    });

    if (!valido) {

        await registrarAuditoria(
            usuario.username,
            "MFA",
            "FALLIDO",
            req.ip
        );

        return res.send("Código MFA incorrecto.");
    }

    await registrarAuditoria(
        usuario.username,
        "MFA",
        "OK",
        req.ip
    );

    await db.run(
        "UPDATE usuarios SET mfa_activado = 1 WHERE id = ?",
        usuario.id
    );

    req.session.usuarioId = usuario.id;

    delete req.session.usuarioMfaId;

    res.redirect("/dashboard");
});

// ==========================================
// DASHBOARD
// ==========================================

app.get("/dashboard", async (req, res) => {

    if (!req.session.usuarioId) {
        return res.redirect("/login");
    }

    const usuario = await db.get(
        "SELECT * FROM usuarios WHERE id = ?",
        req.session.usuarioId
    );

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Dashboard</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">
        </head>

        <body class="bg-light">

            <nav class="navbar navbar-dark bg-dark">

                <div class="container">

                    <span class="navbar-brand">
                        Sistema Seguro 2
                    </span>

                    <a
                        href="/logout"
                        class="btn btn-danger">

                        Cerrar sesión

                    </a>

                </div>

            </nav>

            <div class="container mt-5">

                <div class="card shadow">

                    <div class="card-body">

                        <h2>
                            Bienvenido ${usuario.username}
                        </h2>

                        <p class="text-success">
                            Login y MFA correctos.
                        </p>
                        <a
                            href="/sistema1"
                            class="btn btn-primary">

                            Consultar Sistema 1

                        </a>
                    </div>

                </div>

            </div>

        </body>

        </html>
    `);
});

app.get("/logout", async (req, res) => {

    if (req.session.usuarioId) {

        const usuario = await db.get(
            "SELECT * FROM usuarios WHERE id = ?",
            req.session.usuarioId
        );

        if (usuario) {
            await registrarAuditoria(
                usuario.username,
                "LOGOUT",
                "OK",
                req.ip
            );
        }
    }

    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// ==========================================
// API LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    const {
        username,
        password,
        codigo_mfa
    } = req.body;

    const usuario = await db.get(
        "SELECT * FROM usuarios WHERE username = ?",
        username
    );

    if (!usuario) {
        return res.status(401).json({
            mensaje: "Credenciales incorrectas"
        });
    }

    const correcta = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!correcta) {
        return res.status(401).json({
            mensaje: "Credenciales incorrectas"
        });
    }

    const mfaValido = speakeasy.totp.verify({
        secret: usuario.mfa_secret,
        encoding: "base32",
        token: codigo_mfa,
        window: 1
    });

    if (!mfaValido) {
        return res.status(401).json({
            mensaje: "Código MFA incorrecto"
        });
    }

    await registrarAuditoria(
        usuario.username,
        "API_LOGIN",
        "OK",
        req.ip
    );

    const token = jwt.sign(
        {
            id: usuario.id,
            username: usuario.username
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    );

    res.json({
        mensaje: "Autenticación correcta",
        access_token: token
    });
});
function verificarJWT(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensaje: "Token requerido"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = datos;

        next();

    } catch (error) {

        return res.status(401).json({
            mensaje: "Token inválido"
        });
    }
}

app.get(
    "/api/perfil",
    verificarJWT,
    async (req, res) => {

        const usuario = await db.get(
            "SELECT id, username, activo, mfa_activado FROM usuarios WHERE id = ?",
            req.usuario.id
        );

        await registrarAuditoria(
            req.usuario.username,
            "API_GET_PERFIL",
            "OK",
            req.ip
        );

        res.json(usuario);
    }
);
// ==========================================
// CONSULTAR SISTEMA 1
// ==========================================

app.get("/sistema1", (req, res) => {

    if (!req.session.usuarioId) {
        return res.redirect("/login");
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport"
                  content="width=device-width, initial-scale=1">

            <title>Consultar Sistema 1</title>

            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet">
        </head>

        <body class="bg-light">

            <div class="container mt-5">

                <div class="row justify-content-center">

                    <div class="col-md-6">

                        <div class="card shadow">

                            <div class="card-body">

                                <h2 class="mb-4">
                                    Consultar Sistema 1
                                </h2>

                                <p>
                                    Ingrese las credenciales del Sistema 1.
                                </p>

                                <form
                                    method="POST"
                                    action="/sistema1">

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Usuario
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            class="form-control"
                                            required>

                                    </div>

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Contraseña
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            class="form-control"
                                            required>

                                    </div>

                                    <div class="mb-3">

                                        <label class="form-label">
                                            Código MFA
                                        </label>

                                        <input
                                            type="text"
                                            name="codigo_mfa"
                                            class="form-control"
                                            maxlength="6"
                                            required>

                                    </div>

                                    <button
                                        type="submit"
                                        class="btn btn-primary w-100">

                                        Consultar usuarios

                                    </button>

                                </form>

                                <a
                                    href="/dashboard"
                                    class="btn btn-secondary w-100 mt-3">

                                    Volver

                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </body>

        </html>
    `);
});
app.post("/sistema1", async (req, res) => {

    if (!req.session.usuarioId) {
        return res.redirect("/login");
    }

    const {
        username,
        password,
        codigo_mfa
    } = req.body;

    try {

        // 1. Autenticarse contra Sistema 1
        const loginRespuesta = await axios.post(
            `${process.env.SISTEMA1_URL}/api/login`,
            {
                username,
                password,
                codigo_mfa
            }
        );

        const tokenSistema1 =
            loginRespuesta.data.access_token;

        // 2. Consultar usuarios en Sistema 1
        const usuariosRespuesta = await axios.get(
            `${process.env.SISTEMA1_URL}/api/usuarios`,
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenSistema1}`
                }
            }
        );

        await registrarAuditoria(
            username,
            "CONSULTA_SISTEMA_1",
            "OK",
            req.ip
        );

        const usuarios =
            usuariosRespuesta.data.usuarios;

        let filas = "";

        for (const usuario of usuarios) {

            filas += `
                <tr>
                    <td>${usuario.id}</td>
                    <td>${usuario.username}</td>
                    <td>${usuario.activo}</td>
                    <td>${usuario.mfa_activado}</td>
                </tr>
            `;
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="es">

            <head>

                <meta charset="UTF-8">

                <meta name="viewport"
                      content="width=device-width, initial-scale=1">

                <title>Usuarios Sistema 1</title>

                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                    rel="stylesheet">

            </head>

            <body class="bg-light">

                <div class="container mt-5">

                    <div class="card shadow">

                        <div class="card-body">

                            <h2>
                                Usuarios obtenidos del Sistema 1
                            </h2>

                            <p class="text-success">
                                Comunicación REST realizada correctamente.
                            </p>

                            <table
                                class="table table-striped">

                                <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Activo</th>
                                        <th>MFA</th>
                                    </tr>

                                </thead>

                                <tbody>
                                    ${filas}
                                </tbody>

                            </table>

                            <a
                                href="/dashboard"
                                class="btn btn-primary">

                                Volver al dashboard

                            </a>

                        </div>

                    </div>

                </div>

            </body>

            </html>
        `);

    } catch (error) {

        await registrarAuditoria(
            username,
            "CONSULTA_SISTEMA_1",
            "FALLIDO",
            req.ip
        );

        console.error(
            error.response?.data || error.message
        );

        res.status(500).send(`
            <h2>Error al comunicarse con Sistema 1</h2>
            <p>
                Verifique que Sistema 1 esté iniciado
                y que las credenciales sean correctas.
            </p>
            <a href="/sistema1">
                Volver
            </a>
        `);
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

async function iniciarServidor() {

    await iniciarBaseDatos();

    app.listen(
        PORT,
        () => {

            console.log(
                `Sistema 2 ejecutándose en http://127.0.0.1:${PORT}`
            );

        }
    );

}

iniciarServidor();