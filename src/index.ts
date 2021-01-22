// Dotenv
import * as dotenv from "dotenv";
dotenv.config();

// Express
import express from 'express';

const app = express();
const port = process.env.PORT || '3000';

app.get('/', (req, res) => {
    return res.send('API is working!');
});

app.listen(port, () => {
  return console.log(`Server is listening on http://localhost:${port}`);
});