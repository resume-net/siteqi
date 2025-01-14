const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('Hello, this is a raw HTTP response!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});