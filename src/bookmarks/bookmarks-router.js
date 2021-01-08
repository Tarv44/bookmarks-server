const express = require('express')
const { v4: uuid } = require('uuid')
const bookmarksRouter = express.Router()
const bodyParser = express.json()
const logger = require('../logger')
const BookmarksService = require('../bookmarks-service')

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const db = req.app.get('db')
        BookmarksService.getAllBookmarks(db)
            .then(bookmarks => {
                return res.json(bookmarks)
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        const {title, url, description, rating} = req.body

        if (!title) {
            logger.error('Title is required')
            return res
                .status(400)
                .send('Invalid data.')
        }

        if (!url) {
            logger.error('URL is required')
            return res
                .status(400)
                .send('Invalid data.')
        }

        const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
        const urlRegex = new RegExp(expression)

        if (!url.match(urlRegex)) {
            logger.error('Invalid URL')
            return res  
                .status(400)
                .send('Invalid data.')
        }

        if (Number(rating) < 1 || Number(rating) > 5) {
            logger.error('Number out of range')
            return res  
                .status(400)
                .send('Invalid data.')
        }

        const id = uuid()

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmark/${id}`)
            .json(bookmark);
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const { id } = req.params
        const db = req.app.get('db')
        BookmarksService.getBookmarkById(db, id)
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark with ${id} not found.`)
                    return res 
                        .status(404)
                        .send('Not found')
                }
                res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params
        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with ${id} not found`)
            return res
                .status(404)
                .send('Not found')
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${id} deleted.`)

        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter


