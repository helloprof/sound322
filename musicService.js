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
    Album.findAll().then((data) => {
      resolve(data)
    }).catch((err) => {
      reject("Albums not available")
    })
  })
}

module.exports.getAlbumById = (albumID) => {
  return new Promise((resolve, reject) => {
    Album.findAll({
      where: {
        albumID: albumID
      }
    }).then((data) => {
      resolve(data)
    }).catch((err) => {
      reject("Albums not available for this ID!")
    })
  })
}

module.exports.getAlbumsByGenre = (genreID) => {
  return new Promise((resolve, reject) => {
    Album.findAll({
      where: {
        genreID: genreID
      }
    }).then((data) => {
      resolve(data)
    }).catch((err) => {
      reject("Albums not available for this genre!")
    })
  })
}

module.exports.getGenres = () => {
  return new Promise((resolve, reject) => {
    Genre.findAll().then((data) => {
      resolve(data)
    }).catch((err) => {
      reject("Genres not available")
    })
  })
}

module.exports.addAlbum = (album) => {
  return new Promise((resolve, reject) => {
    Album.create(album).then((data) => {
      console.log("NEW ALBUM ADDED, data:" +data)
      resolve()
    }).catch((err) => {
      console.log("NEW ALBUM FAILED TO ADD, ERROR:"+ err)
      reject()
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

module.exports.addGenre = (genre) => {
  return new Promise((resolve, reject) => {
    Genre.create(genre).then((data) => {
      console.log("NEW GENRE ADDED, data:" +data)
      resolve()
    }).catch((err) => {
      console.log("NEW GENRE FAILED TO ADD, ERROR:"+ err)
      reject()
    })
  })
}

module.exports.deleteGenre = (genreID) => {
  return new Promise((resolve, reject) => {
    Genre.destroy({
      where: {
        genreID: genreID
      }
    }).then(() => {
      console.log("GENRE DELETED SUCCESSFULLY!")
      resolve()
    }).catch((err) => {
      console.log("GENRE DELETE FAILURE, ERROR:" +err)
      reject()
    })
  })
}

module.exports.addSong = (song) => {
  return new Promise((resolve, reject) => {
    Song.create(song).then((data) => {
      console.log("NEW SONG ADDED, data:" +data)
      resolve()
    }).catch((err) => {
      console.log("NEW SONG FAILED TO ADD, ERROR:"+ err)
      reject()
    })
  })
}

module.exports.getSongs = (albumID) => {
  return new Promise((resolve, reject) => {
    Song.findAll({
      where: {
        albumID: albumID
      }
    }).then((data) => {
      resolve(data)
    }).catch((err) => {
      console.log(err)
      reject("Songs not available")
    })
  })
}

module.exports.deleteSong = (songID) => {
  return new Promise((resolve, reject) => {
    Song.destroy({
      where: {
        songID: songID
      }
    }).then(() => {
      console.log("SONG DELETED SUCCESSFULLY!")
      resolve()
    }).catch((err) => {
      console.log("SONG DELETE FAILURE, ERROR:" +err)
      reject()
    })
  })
}