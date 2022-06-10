const express = require("express")
const app = express()

const env = require("dotenv")
env.config()

const path = require("path")

const musicService = require("./musicService")

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

app.get("/albums/:id", (req, res) => {
  musicService.getAlbumById(req.params.id).then((album) => {
    res.json(album)
  }).catch((err) => {
    res.json({message: err})
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
