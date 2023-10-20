const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors")
const songs = require("./routes/songFile");
const app = express();

mongoose
  .connect("mongodb://127.0.0.1:27017/mysongs")
  .then(() => console.log("database connected"))
  .catch((err) => console.log("error in db connection"+ err));

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/yusuf", songs);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
