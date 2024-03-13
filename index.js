import express from "express";
import cors from "cors";
import mercadoPago from './routes/mercadoPago.js'; 


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());


// Define los orígenes permitidos como un array de URLs
const allowedOrigins = ['https://mercadobacktest.onrender.com', 'https://mercadofront.onrender.com'];

// Usa cors con opciones específicas
app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);



// API
app.get("/", (req, res) => {
    res.send("Sou eu!");
});


// Rutas de MercadoPago
app.use('/', mercadoPago); 

app.listen(port, () => {
    console.log("listening on port " + port);
});