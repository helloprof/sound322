const fs = require("fs")

let albums = []
let genres = []

const env = require("dotenv")
env.config()

const Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
})

// sequelize
//     .authenticate()
//     .then(function() {
//         console.log('Connection has been established successfully.')
//     })
//     .catch(function(err) {
//         console.log('Unable to connect to the database:', err)
//     })

var Album = sequelize.define('Album', {
  albumID: {
    type: Sequelize.INTEGER,
    primaryKey: true, 
    autoIncrement: true
  },
  title: Sequelize.STRING,
  artist: Sequelize.STRING,
  albumCover: Sequelize.STRING,
  year: Sequelize.INTEGER
})

var Song = sequelize.define('Song', {
  songID: {
    type: Sequelize.INTEGER,
    primaryKey: true, 
    autoIncrement: true
  },
  title: Sequelize.STRING,
  songFile: Sequelize.STRING,
  single: Sequelize.BOOLEAN
})

var Genre = sequelize.define('Genre', {
  genreID: {
    type: Sequelize.INTEGER,
    primaryKey: true, 
    autoIncrement: true
  },
  genre: Sequelize.STRING
})

Song.belongsTo(Album, {foreignKey: 'albumID'})
Album.belongsTo(Genre, {foreignKey: 'genreID'})

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    
    // fs.readFile('./data/albums.json', 'utf8', (err, data) => {
    //   if (err) {
    //     reject(err)
    //   } else {

    //     albums = JSON.parse(data)
    //     fs.readFile('./data/genres.json', 'utf8', (err, data) => {
    //       if (err) {
    //         reject(err)
    //       } else {
    //         genres = JSON.parse(data)
    //         resolve("SUCCESS")
    //       }
    //     })
    //   }
    // })

    sequelize.sync().then(() => {
      console.log("DATABASE SYNC SUCCESSFUL")
      resolve()
    }).catch((err) => {
      console.log("DATABASE SYNC FAILED! ERROR:" + err)
    })
  })
}

module.exports.getAlbums = () => {
  return new Promise((resolve, reject) => {
    // if(albums.length > 0) {
    //   resolve(albums)
    // } else {
    //   reject("no albums")
    // }

    Album.findAll().then((data) => {
      resolve(data)
    }).catch((err) => {
      reject("Albums not available")
    })
  })
}

module.exports.getAlbumById = (id) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < albums.length; i++) {
      var album;
      if (albums[i].id == id) {
        album = albums[i]
      }

      // // using array function find (single object is returned)
      // let album = albums.find(album => album.id == id)
    }

    if(album) {
      resolve(album)
    } else {
      reject("album not found with this ID!")
    }

  })
}

module.exports.getAlbumsByGenre = (genre) => {
  return new Promise((resolve, reject) => {
    let albumsArray = []
    for (let i = 0; i < albums.length; i++) {
      if(albums[i].genre == genre) {
        albumsArray.push(albums[i])
      }
    }
    if (albumsArray.length > 0 ) {
      resolve(albumsArray)
    } else {
      reject("no albums with that genre")
    }
  })
}

module.exports.getGenres = () => {
  return new Promise((resolve, reject) => {
    if(genres.length > 0) {
      resolve(genres)
    } else {
      reject("no genres")
    }
  })
}

module.exports.addAlbum = (album) => {
  return new Promise((resolve, reject) => {
    // if (album) {
    //   album.id = albums.length + 1
    //   albums.push(album)
    //   resolve("success")
    // } else {
    //   reject("no album data available")
    // }

    Album.create(album).then((data) => {
      console.log("NEW ALBUM ADDED, data:" +data)
      resolve()
    }).catch((err) => {
      console.log("NEW ALBUM FAILED TO ADD, ERROR:"+ err)
    })
  })
}

module.exports.deleteAlbum = (albumID) => {
  return new Promise((resolve, reject) => {

    Album.destroy({
      where: {
        albumID: albumID
      }
    }).then(() => {
      console.log("ALBUM DELETED SUCCESSFULLY!")
      resolve()
    }).catch((err) => {
      console.log("ALBUM DELETE FAILURE, ERROR:" +err)
      reject()
    })
  })
}