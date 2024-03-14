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
/*
// Función para verificar la firma de la notificación
function verifySignature(headers, body, secretKey) {
    const signature = headers['x-signature'];
    const hmac = crypto.createHmac('sha256', secretKey);
    const calculatedSignature = hmac.update(body).digest('hex');
    return signature === calculatedSignature;
}



// Ruta para el webhook de Mercado Pago
router.post('/webhook', (req, res) => {
    // Verificar firma de la notificación
    const secretKey = 'tu_clave_secreta_de_webhook_de_mercado_pago'; // Reemplaza con tu clave secreta

    if (!verifySignature(req.headers, JSON.stringify(req.body), secretKey)) {
        console.error('Firma inválida. La notificación podría no ser válida.');
        return res.status(401).send('Unauthorized');
    }

    // Procesar la notificación y extraer los datos relevantes
    const paymentData = req.body;
    const payerName = paymentData.payer.name;
    const payerEmail = paymentData.payer.email;

    // Haz lo que necesites con los datos del pagador
    console.log('Nombre del pagador:', payerName);
    console.log('Correo electrónico del pagador:', payerEmail);

    // Devolver una respuesta exitosa
    res.status(200).send('OK');
});

*/


//////////////WEBHOOK VIDEO////////////////////

router.post('/webhook', async function (req, res){
    const payment = req.query;
    console.log({ payment });

    const paymentId = req.query.id;

    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${client.accessToken}`
            }
        });

        if(response.ok){
            const data = await response.json();
            console.log(data);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Error', error);
        res.sendStatus(500);
    }
})



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
            notification_url: 'https://mercadobacktest.onrender.com/webhook'
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
