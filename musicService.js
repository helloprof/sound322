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

// module.exports.getPublishedAlbums = () => {
//   return new Promise((resolve, reject) => {
//     let publishedAlbums = []
//     for (let i = 0; i < albums.length; i++) {
//       if(albums[i].published == true) {
//         publishedAlbums.push(albums[i])
//       }
//     }
//     resolve(publishedAlbums)
//   })
// }

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