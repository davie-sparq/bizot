const express = require('express');
const path = require('path');
const app = express();
const p = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(p, () => console.log('listening', p));
