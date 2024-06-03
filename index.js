const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const router = require('./src/routes/routes')
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
console.log("ekewiefjoiewoe")
app.use(router)



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
