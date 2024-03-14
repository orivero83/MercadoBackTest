// mercadoPago.js
import express from "express";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';

const router = express.Router();


const MP_ACCESS_TOKENB = process.env.MP_ACCESS_TOKENB;
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKENB });


// Middleware de conexión a la base de datos
router.use((req, res, next) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  
    connection.connect((err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Conectado a la base de datos MySQL');
        req.dbConnection = connection; // Adjuntar la conexión al objeto de solicitud
        next(); // Continuar con la siguiente middleware/ruta
      }
    });
  });


// Ruta para el webhook de Mercado Pago
router.post("/webhook", (req, res) => {
    try {
        console.log("Datos recibidos:", req.body); // 
        // Extraer datos del cuerpo de la solicitud
        const { action, api_version, data, date_created, id, live_mode, type, user_id } = req.body;

        // Verificar el identificador único asociado con la transacción
        const transactionId = data.id; // Obtener el identificador único asociado con la transacción desde el cuerpo de la solicitud
        const expectedTransactionId = process.env.EXPECTED_TRANSACTION_ID; // Obtener el identificador único esperado desde las variables de entorno

        if (transactionId !== expectedTransactionId) {
            console.error('Identificador de transacción incorrecto. La notificación podría no ser válida.');
            return res.status(401).send('Unauthorized');
        }

        // Insertar datos en la base de datos
        req.dbConnection.query('INSERT INTO mercadowebhooktable (action, api_version, data, date_created, id, live_mode, type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [action, api_version, JSON.stringify(data), new Date(date_created), id, live_mode, type, user_id],
            (error, results) => {
                if (error) {
                    console.error('Error al insertar datos en la base de datos:', error);
                    res.status(500).send('Internal Server Error');
                } else {
                    // Verificar si la inserción fue exitosa y enviar respuesta
                    if (results && results.insertId !== undefined) {
                        console.log('Datos insertados correctamente en la base de datos.');
                        res.status(200).send("Notificación y datos insertados correctamente");
                    } else {
                        console.error('Error al procesar la solicitud');
                        res.status(500).send('Error al procesar la solicitud');
                    }
                }
            });

    } catch (error) {
        console.error('Error al procesar la notificación:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Ruta para crear preferencia MERCADO PAGO
router.post("/preference", async (req, res) => {
    try {
        console.log('Datos recibidos en el servidor:', req.body);
        const body = {
            items: [
                {
                    title: req.body.title,
                    quantity: Number(req.body.quantity),
                    unit_price: Number(req.body.unit_price),
                    currency_id: req.body.currency_id,

                },
            ],

            back_urls: {
                success: 'https://www.danirivero.com',
                failure: 'http://www.danirivero.com',
                pending: 'http://www.danirivero.com',
            },
            auto_return: 'approved',
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        console.log('Respuesta del servidor:', result);
        res.json({
            id: result.id,
        })

    } catch (err) {
        res.status(500).send("preference" + err);
    }
})




// Ruta para obtener el token FRONT
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
router.get('/token', (req, res) => {
    // Envía el token al cliente de manera segura
    res.json({ mpAccessToken: MP_ACCESS_TOKEN });
});


export default router;
