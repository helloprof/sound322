const fs = require("fs")

let albums = []
let genres = []

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    
    fs.readFile('./data/albums.json', 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {

        albums = JSON.parse(data)
        fs.readFile('./data/genres.json', 'utf8', (err, data) => {
          if (err) {
            reject(err)
          } else {
            genres = JSON.parse(data)
            resolve("SUCCESS")
          }
        })
      }
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

module.exports.getAlbums = () => {
  return new Promise((resolve, reject) => {
    if(albums.length > 0) {
      resolve(albums)
    } else {
      reject("no albums")
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
    if (album) {
      album.id = albums.length + 1
      albums.push(album)
      resolve("success")
    } else {
      reject("no album data available")
    }
  })
}