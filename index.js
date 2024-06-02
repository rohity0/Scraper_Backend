// index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const router = require('./src/controller/controller')
const app = express();

app.use(cors());
app.use(express.json());
connectDB();
app.use(router)



const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
