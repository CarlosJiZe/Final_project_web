const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/html/index.html");
});

app.get("/graficas", (req, res) => {
    res.sendFile(__dirname + "/public/html/graficas.html");
});

app.get("/datos", (req, res) => {
    res.sendFile(__dirname + "/public/html/datos.html");
});

app.listen(3002, ()=>{
    console.log('Server is running on port 3002');
});