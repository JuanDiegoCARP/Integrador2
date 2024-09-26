
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const translate = require('node-google-translate-skidz');
require('dotenv').config();


const app = express();
const port = 3000;

app.use(express.json());

app.post('/translate', async (req, res) => {
    const { text, targetLang } = req.body;

    try {
        // Asumiendo que 'translate' es una función que devuelve una promesa
        const result = await translate({
            text: text,
            source: 'en',
            target: targetLang
        });

        if (result && result.translation) {
            res.json({
                translatedText: result.translation // Asegurarte que el campo coincide con lo que esperas en el cliente
            });
        } else {
            res.status(500).json({ error: 'Error al traducir' });
        }
    } catch (error) {
        console.error('Error al traducir:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud de traducción' });
    }
});







app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});

// commit 