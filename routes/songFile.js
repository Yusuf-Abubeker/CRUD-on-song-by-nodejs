const grid = require("gridfs-stream");
const express = require("express");
const mongoose = require("mongoose");
const { Song, validater } = require("../models/songModel");
const multer = require("multer");
const util = require("util");
const path = require("path");
const fs = require("fs");

const { Types } = mongoose;
const router = express.Router();

let gfs;

const conn = mongoose.connection;
conn.once("open", () => {
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection("songFiles"); // Use a specific collection for song files
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "music/"); // Set the destination folder where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file (e.g., use the song's title or a random string)
    const uniqueFilename = Date.now() + "-" + file.originalname;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

router.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json(songs);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to retrieve songs" });
  }
});
router.get("/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (id !== null) {
      const song = await Song.findById(id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.status(201).json(song);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to retrieve songs" });
  }
});

router.get("/songs/:id/audio", async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id);
    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const songFilePath = song.songFile; // Get the local path to the song file

    if (!songFilePath) {
      return res.status(400).json({ error: "Song file path not found" });
    }

    // Determine the content type based on the file extension (e.g., mp3)
    const extname = path.extname(songFilePath);
    const contentType = `audio/${extname.slice(1)}`;

    // Set the response headers for audio playback in the browser
    res.set("Content-Type", contentType);
    res.set(
      "Content-Disposition",
      `inline; filename="${path.basename(songFilePath)}"`
    );

    // Create a read stream and pipe it to the response
    const readStream = fs.createReadStream(songFilePath);
    readStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to retrieve and play the song" });
  }
});

router.post("/songs", upload.single("songFile"), async (req, res) => {
  const { error } = validater(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { title, artist, genre, releaseYear } = req.body;

  try {
    const newSong = new Song({
      title,
      artist,
      genre,
      releaseYear,
    });

    if (req.file) {
      newSong.songFile = req.file.path;
    }
    newSong.save();
    res.status(200).send(newSong);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create the song" });
  }
});

router.put("/songs/:id", upload.single("songFile"), async (req, res) => {
  const { id } = req.params;
  const { title, artist, genre, releaseYear } = req.body;

  try {
    const song = await Song.findById(id).exec();

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Update the song metadata
    if (title) {
      song.title = title;
    }
    if (artist) {
      song.artist = artist;
    }
    if (genre) {
      song.genre = genre;
    }
    if (releaseYear) {
      song.releaseYear = releaseYear;
    }
    if (req.file) {
      song.songFile = req.file.path;
    }
    await song.save();

    res.status(200).json(song);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update the song" });
  }
});

router.delete("/songs/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const song = await Song.findById(id).exec();

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Get the path of the song file
    const songFilePath = song.songFile;

    if (songFilePath) {
      // Delete the song file from your server's storage
      fs.unlinkSync(songFilePath);
    }

    // Delete the song document from the database
    await Song.findByIdAndDelete(id).exec();

    res.status(204).json("successfullly deleted"); // Successfully deleted
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to delete the song" });
  }
});

module.exports = router;
