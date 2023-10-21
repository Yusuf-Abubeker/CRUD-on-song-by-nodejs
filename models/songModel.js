const mongoose = require("mongoose");
const Joi = require("joi");
// Define the schema for the Song model
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  genre: String,
  releaseYear: Number,
  // Add a reference to the song file in GridFS
  songFile: String,
  // You can add more fields as needed
});

// Create the Song model based on the schema
const Song = mongoose.model("Song", songSchema);

function validater(song) {
  const schema = Joi.object({
    title: Joi.string().required(),
    artist: Joi.string().required(),
    genre: Joi.string().required(),
    releaseYear: Joi.string().required(),
  
  });
  return schema.validate(song);
}
module.exports.validater = validater;
module.exports.Song = Song;
