const mongoose = require('mongoose');

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
const Song = mongoose.model('Song', songSchema);

// Export the Song model for use in other parts of your application
module.exports = Song;
