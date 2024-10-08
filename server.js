const express = require("express");
const app = express();
const mongoose = require("mongoose");
const csv = require('csvtojson');
const moment = require('moment');
const fs = require("fs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs",require("ejs").renderFile);
app.set("view engine","ejs");

const mongoUrl = "mongodb://127.0.0.1:27017/f1";
mongoose.connect('mongodb://localhost:27017/lagoDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB', err));

  const lagoSchema = new mongoose.Schema({
    clave_sih: { type: String, required: true },
    fecha: { type: Date, required: true },
    nombre_oficial: { type: String, required: true },
    nombre_comun: { type: String, required: true },
    estado: { type: String, required: true },
    municipio: { type: String, required: true },
    almacenamiento_hm3: { type: Number, required: true },
    elevacion_msnm: { type: Number, required: true },
    uso: { type: String, required: true },
    namo_almacenamiento_hm3: { type: Number, required: true },
    namo_elevacion_msnm: { type: Number, required: true },
    porcentaje_llenado: { type: Number, required: true },
    bordo_libre_m: { type: Number, required: true },
    name_almacenamiento_hm3: { type: Number, required: true },
    name_elevacion_msnm: { type: Number, required: true }
});

const Lago = mongoose.model('Lago', lagoSchema);

imagesca=[
    {
        "name":"lago1",
        "description":"Lago rebasando el muelle"
    },
    {
        "name":"lago2",
        "description":"El Sol sobre el Lago"
    },
    {
        "name":"lago3",
        "description":"Faro y Lago a plenitud"
    },
    {
        "name":"lago4",
        "description":"Lago rebosante"
    },
    {
        "name":"lago5",
        "description":"Faro, 1960's"
    },
    {
        "name":"lago6",
        "description":"Faro del Lago de Chapala, 2003"
    },
    {
        "name":"lago7",
        "description":"Oleaje en el Lago de Chapala"
    }
];


const loadCSVData = async () => {
    try {
      const jsonObj = await csv().fromFile(__dirname+"/public/data/presas_jal_ldcjl_lago_de_chapala_almacenamiento_historico_2024-08-01.csv");  
  
      const formattedData = jsonObj.map(item => {
        item.fecha = moment(item.fecha, 'DD-MM-YYYY').toDate();  
        return item;
      });
  
      
      await Lago.insertMany(formattedData);
      console.log('Datos guardados exitosamente en MongoDB');
    } catch (err) {
      console.error('Error al cargar los datos del CSV:', err);
    }
  };
  
  (async () => {
    try {
      const count = await Lago.countDocuments();
      if (count === 0) {
        console.log('No se encontraron documentos en la colección. Cargando datos del CSV...');
        await loadCSVData(); 
      } else {
        console.log('Ya existen documentos en la base de datos.');
      }
    } catch (err) {
      console.error("Error al contar documentos:", err);
    }
  })();

app.get("/", (req, res) => {
    //res.sendFile(__dirname + "/public/html/index.html");
    res.render("index",{images:imagesca});
});

app.get("/graficas", (req, res) => {
    //res.sendFile(__dirname + "/public/html/graficas.html");
    res.render("graficas");
});

app.get('/datos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Página actual, por defecto la 1
        const limit = 100; // Mostrar 100 registros por página
        const skip = (page - 1) * limit; // Calcular el número de documentos a omitir

        const totalRecords = await Lago.countDocuments(); // Contar todos los documentos
        const totalPages = Math.ceil(totalRecords / limit); // Calcular el número total de páginas

        const lagos = await Lago.find()
            .skip(skip) // Omitir documentos
            .limit(limit); // Limitar a 100 documentos

        // Renderizar la vista EJS con los datos paginados
        res.render('datos', {
            lagos,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error('Error al obtener los datos:', err);
        res.status(500).send('Error al obtener los datos');
    }
});

app.listen(3002, ()=>{
    console.log('Server is running on port 3002');
});