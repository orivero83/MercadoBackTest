import express from "express";
import cors from "cors";
import mercadoPago from './routes/mercadoPago.js'; 


const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());


// API
app.get("/", (req, res) => {
    res.send("Sou eu!");
});


// Rutas de MercadoPago
app.use('/', mercadoPago); 

app.listen(port, () => {
    console.log("listening on port " + port);
});