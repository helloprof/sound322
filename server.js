const express = require("express")
const app = express()

const env = require("dotenv")
env.config()

const path = require("path")
const musicService = require("./musicService")

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
})

const upload = multer()

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express server is listening on PORT: " + HTTP_PORT + " 🚀🚀🚀")
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"))
})

app.get("/albums", (req, res) => {
  musicService.getAlbums()
    .then((albums) => {
      res.json(albums)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.post("/albums/new", upload.single("albumCover"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processAlbum(uploaded.url);
    });
  } else {
    processAlbum("");
  }

  function processAlbum(imageUrl) {
    req.body.albumCover = imageUrl;

    musicService.addAlbum(req.body).then(() => {
      res.redirect("/albums")
    })
  }

})

app.get("/albums/new", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/albumForm.html"))
})

app.get("/albums/:id", (req, res) => {
  musicService.getAlbumById(req.params.id).then((album) => {
    res.json(album)
  }).catch((err) => {
    res.json({ message: err })
  })
})

app.get("/genres", (req, res) => {
  musicService.getGenres()
    .then((genres) => {
      res.json(genres)
    })
    .catch((err) => {
      console.log(err)
    })
})

app.use((req, res) => {
  res.status(404).send("Page Not Found")
})


musicService.initialize().then(() =>
  app.listen(HTTP_PORT, onHttpStart)
).catch((err) => {
  console.log(err)
})
