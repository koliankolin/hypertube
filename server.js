const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (request, response) => response.send('API running'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));