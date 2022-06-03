const express = require("express")
const app = express()

const env = require("dotenv")
env.config()

const musicService = require("./musicService")

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express server is listening on PORT: " + HTTP_PORT + " 🚀🚀🚀")
}

app.get("/", (req, res) => {
  res.send("sound322")
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
