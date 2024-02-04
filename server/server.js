require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./routes/user.routes')
const adminRoutes =  require('./routes/admin.routes');
const authorRoutes = require('./routes/author.routes')
const PORT = process.env.PORT || 3003;

// Middleware for parsing body
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/author',authorRoutes)

// Server Route
app.get('/', (req, res) => {
  res.json({ message: 'Example route response' });
});
mongoose.set("strictQuery", true);
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};


startServer();
