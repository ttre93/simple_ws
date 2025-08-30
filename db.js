// server.js
const express = require('express');
const app = express();
const PORT = 3000;

// Parse JSON bodies (for POST requests with JSON)
app.use(express.json());

// Parse URL-encoded bodies (for HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from public/
app.use(express.static('public'));

// Example route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
