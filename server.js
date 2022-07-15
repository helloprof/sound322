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

const exphbs = require('express-handlebars')
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  // layoutsDir: 'views/layouts',
  // defaultLayout: 'main',
  // partialsDir: 'views/partials'
}))
app.set('view engine', '.hbs')

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express server is listening on PORT: " + HTTP_PORT + " 🚀🚀🚀")
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/index.html"))
  res.redirect("/albums")
})

app.get("/albums", (req, res) => {
  // if (req.query.genre) {
  //   musicService.getAlbumsByGenre(req.query.genre).then((genreAlbums) => {
  //     res.render('index', {
  //       data: genreAlbums,
  //       layout: 'main'
  //     })
  //   }).catch((err) => {
  //     console.log(err)
  //     res.render('index', {
  //       message: err
  //     })
  //   })
  // } else {
    musicService.getAlbums()
      .then((albums) => {
        // res.json(albums)
        // console.log(albums)
        res.render('index', {
          data: albums,
          layout: 'main'
        })
      })
      .catch((err) => {
        res.render('index', {
          message: err
        })
      })
  // }
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
  // res.sendFile(path.join(__dirname, "/views/albumForm.html"))
  res.render('albumForm')
  // musicService.getGenres().then((genresData) => {
  //   res.render("albumForm", {
  //     data: genresData,
  //     layout: 'main'
  //   })
  // })
})

// app.get("/albums/:id", (req, res) => {
//   musicService.getAlbumById(req.params.id).then((album) => {
//     // res.json(album)
//     let tempAlbumArray = []
//     tempAlbumArray.push(album)
//     res.render('index', {
//       data: tempAlbumArray,
//       layout: 'main'
//     })
//   }).catch((err) => {
//     res.render('index', 
//     { message: err })
//   })
// })

// app.get("/genres", (req, res) => {
//   musicService.getGenres()
//     .then((genres) => {
//       // res.json(genres)
//       res.render('genres', {
//         data: genres,
//         layout: 'main'
//       })
//     })
//     .catch((err) => {
//       console.log(err)
//       res.render('genres', {message: err})
//     })
// })

app.get('/albums/delete/:id', (req, res) => {
  musicService.deleteAlbum(req.params.id).then(() => {
    res.redirect('/albums')
  }).catch((err) => {
    res.status(500).send("ALBUM DELETE FAILURE")
  })
})

app.use((req, res) => {
  // res.status(404).send("Page Not Found")
  res.render('404', {
    data: null,
    layout: 'main'
  })
})


musicService.initialize().then(() =>
  app.listen(HTTP_PORT, onHttpStart)
).catch((err) => {
  console.log(err)
})
