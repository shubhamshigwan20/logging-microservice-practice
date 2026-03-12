const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const logRoutes = require("./routes/logRoutes");
const errorMiddleware = require("./middlewares/errorHandlingMiddleware");
require("dotenv").config();

const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
    message: "consumer-service running",
  });
});

app.use(logRoutes);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
