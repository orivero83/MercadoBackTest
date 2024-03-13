import express from "express";
import cors from "cors";
import mercadoPago from './routes/mercadoPago.js'; 


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());


// Usa cors con opciones específicas
const frontendURL = 'https://mercadofront.onrender.com';
app.use(
  cors({
    origin: frontendURL,
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