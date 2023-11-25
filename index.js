const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors")
const songs = require("./routes/songFile");
const app = express();
 
const uri = process.env.MONGODB_URI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("database connected"))
  .catch((err) => console.log("error in db connection"+ err));

const allowedOrigins = ["https://song-hub.vercel.app", "http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

app.use("/yusuf", songs);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
