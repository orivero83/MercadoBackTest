// mercadoPago.js
import express from "express";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2';
import crypto from 'crypto';

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

/////////////////////////////////////WEBHOOK//////////////////////////


router.post("/webhook", (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        const signatureHeader = req.headers['x-signature'];
        const [timestamp, signature] = signatureHeader.split(',');
        
        const signatureTemplate = `id:${req.body.data.id};ts:${timestamp};`;
        
        const secretKey = process.env.MP_WEBHOOK_SECRET; // Obtener la clave secreta de Mercado Pago desde las variables de entorno
        
        const generatedSignature = crypto.createHmac('sha256', secretKey)
            .update(signatureTemplate)
            .digest('hex');

        if (generatedSignature !== signature) {
            console.error('Firma inválida. La notificación podría no ser válida.');
            return res.status(401).send('Unauthorized');
        }

        // Si la firma es válida, continuar con el procesamiento de la notificación
        // Insertar datos en la base de datos, etc.

        res.status(200).send("Notificación recibida y autenticada correctamente");

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
