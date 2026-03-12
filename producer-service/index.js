const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const router = require("./routes/appRoutes");
const errorMiddleware = require("./middlewares/errorHandlingMiddleware");
const PORT = process.env.PORT;

app.use(express.json());
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({
    status: true,
    timestamp: new Date().toLocaleString(),
    message: "producer-service running",
  });
});
app.use(router);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`server started on PORT ${PORT}`);
});
