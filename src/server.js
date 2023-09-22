const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.set('views', __dirname + '/views');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: 'ReVUW' });
});

const PORT = 3000;
app.listen(PORT, () => {
   console.log(`Server is running on http://localhost:${PORT}`);
});