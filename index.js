
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
//const translate = require('node-google-translate-skidz');
require('dotenv').config();


const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/departamentos', async (req, res) => {
const URLDpto = "https://collectionapi.metmuseum.org/public/collection/v1/departments"
try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data.departments);
} catch (error) {
    console.error('Error al obtener los departamentos:', error);
    res.status(500).json({ error: 'Error al obtener los departamentos.' });
}
})


app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});

