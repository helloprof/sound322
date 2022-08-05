const express = require("express")
const app = express()

const env = require("dotenv")
env.config()

const clientSessions = require("client-sessions")

const path = require("path")
const musicService = require("./musicService")
const userService = require("./userService")

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
app.use(express.urlencoded({ extended: true }));

const exphbs = require('express-handlebars')
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  // layoutsDir: 'views/layouts',
  // defaultLayout: 'main',
  // partialsDir: 'views/partials'
}))
app.set('view engine', '.hbs')

app.use(clientSessions({
  cookieName: "session",
  secret: "week12sound322example123456705082022",
  duration: 2 * 60 * 1000,
  activeDuration: 60 * 1000
}))

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next()
})

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express server is listening on PORT: " + HTTP_PORT + " 🚀🚀🚀")
}

app.use(express.static("public"));

app.get("/", (req, res) => {
  // res.sendFile(path.join(__dirname, "/views/index.html"))
  res.redirect("/albums")
})

app.get("/albums", ensureLogin, (req, res) => {
  if (req.query.genre) {
    musicService.getAlbumsByGenre(req.query.genre).then((genreAlbums) => {
      res.render('index', {
        data: genreAlbums,
        layout: 'main'
      })
    }).catch((err) => {
      console.log(err)
      res.render('index', {
        message: err
      })
    })
  } else {
    musicService.getAlbums()
      .then((albums) => {
        console.log("ALBUMS HERE:")
        console.log(albums)
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
  }
})

app.post("/albums/new", ensureLogin, upload.single("albumCover"), (req, res) => {
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

app.get("/albums/new", ensureLogin, (req, res) => {
  musicService.getGenres().then((genresData) => {
    res.render("albumForm", {
      data: genresData,
      layout: 'main'
    })
  })
})

app.get("/albums/:id", ensureLogin, (req, res) => {
  musicService.getAlbumById(req.params.id).then((album) => {
    res.render('index', {
      data: album,
      layout: 'main'
    })
  }).catch((err) => {
    res.render('index', 
    { message: err })
  })
})

app.get("/genres", ensureLogin, (req, res) => {
  musicService.getGenres().then((genres) => {
      res.render('genres', {
        data: genres,
        layout: 'main'
      })
    })
    .catch((err) => {
      console.log(err)
      res.render('genres', {message: err})
    })
})

app.get('/albums/delete/:id', ensureLogin, (req, res) => {
  musicService.deleteAlbum(req.params.id).then(() => {
    res.redirect('/albums')
  }).catch((err) => {
    res.status(500).send("ALBUM DELETE FAILURE")
  })
})

app.get("/genres/new", ensureLogin, (req, res) => {
  res.render('genreForm')
})

app.post("/genres/new", ensureLogin, (req, res) => {
  musicService.addGenre(req.body).then(() => {
    res.redirect('/genres')
  }).catch((err) => { 
    res.status(500).send(err)
  })
})

app.get('/genres/delete/:id', ensureLogin, (req, res) => {
  musicService.deleteGenre(req.params.id).then(() => {
    res.redirect('/genres')
  }).catch((err) => {
    res.status(500).send("ALBUM DELETE FAILURE")
  })
})

app.get("/songs/new", ensureLogin, (req, res) => {
  musicService.getAlbums().then((albums) => {
    res.render("songForm", {
      data: albums,
      layout: 'main'
    })
  })
})

app.post("/songs/new", ensureLogin, upload.single("songFile"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {resource_type: "video",
            use_filename: true },
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
      processSong(uploaded.url);
    });
  } else {
    processSong("");
  }

  function processSong(imageUrl) {
    req.body.songFile = imageUrl;

    musicService.addSong(req.body).then((albumID) => {
      // var songRoute = path.join("/songs",req.body.albumID)
      res.redirect(`/songs/${albumID}`)
    })
  }
})

app.get("/songs/:albumID", ensureLogin, (req, res) => {
  musicService.getSongs(req.params.albumID).then((songs) => {
    res.render("songs", {
      data: songs,
      layout: 'main'
    })
  })
})

app.get('/songs/delete/:id', ensureLogin, (req, res) => {
  musicService.deleteSong(req.params.id).then((albumID) => {
    res.redirect(`/songs/${albumID}`)
  }).catch((err) => {
    res.status(500).send("SONG DELETE FAILURE")
  })
})

app.get("/register", (req, res) => {
  res.render('registerForm')
})

app.post("/register", (req, res) => {
  userService.registerUser(req.body).then((data) => {
    console.log(data)
    res.render('registerForm', {
      successMessage: "USER CREATED"
    })
  }).catch((error) => { 
    console.log(error)
    res.render('registerForm', {
      errorMessage: "USER CREATION ERROR: "+error
    })
  })
})

app.get("/login", (req, res) => {
  res.render('loginForm')
})

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent')
  userService.loginUser(req.body).then((user) => {
    // session stuff
    req.session.user = {
      username: user.username,
      email: user.email,
      loginHistory: user.loginHistory
    }
    console.log(req.session.user)
    res.redirect('/albums')
  }).catch((error) => { 
    console.log(error)
    res.render('loginForm', {
      errorMessage: "USER LOGIN ERROR: "+error
    })
  })
})

app.get("/loginHistory", ensureLogin, (req, res) => {
  res.render("loginHistory")
})

app.get("/logout", ensureLogin, (req, res) => {
  req.session.reset()
  res.redirect("/login")
})

app.use((req, res) => {
  // res.status(404).send("Page Not Found")
  res.render('404', {
    data: null,
    layout: 'main'
  })
})

musicService.initialize()
.then(userService.initialize)
.then(() => {
  app.listen(HTTP_PORT, onHttpStart)
}).catch((err) => {
  console.log(err)
})
