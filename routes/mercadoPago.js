// mercadoPago.js
import express from "express";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';
dotenv.config();


const router = express.Router();


const MP_ACCESS_TOKENB = process.env.MP_ACCESS_TOKENB;
const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKENB });

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



// Ruta para el webhook de Mercado Pago
router.post("/webhook", (req, res) => {
    try {
        // Verificar la clave secreta
        const secretKey = req.headers['x-api-key']; // Utiliza el encabezado correcto

        if (secretKey !== process.env.MP_WEBHOOK_SECRET) {
            console.error('Clave secreta incorrecta. La notificación podría no ser válida.');
            return res.status(401).send('Unauthorized');
        }

        // Manejar las notificaciones del webhook aquí
        console.log('Notificación de Mercado Pago recibida:', JSON.stringify(req.body, null, 2));
        res.status(200).send("Notificación recibida");
    } catch (error) {
        console.error('Error al procesar la notificación:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Ruta para obtener el token FRONT
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
router.get('/token', (req, res) => {
    // Envía el token al cliente de manera segura
    res.json({ mpAccessToken: MP_ACCESS_TOKEN });
});


export default router;
