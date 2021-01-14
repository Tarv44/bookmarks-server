const path = require('path')
const express = require('express')
const xss = require('xss')
const bookmarksRouter = express.Router()
const { isWebUri } = require('valid-url')
const bodyParser = express.json()
const logger = require('../logger')
const BookmarksService = require('../bookmarks-service')

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    bookmark_url: bookmark.bookmark_url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating)
})

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const db = req.app.get('db')
        BookmarksService.getAllBookmarks(db)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'bookmark_url', 'rating']) {
            if (!req.body[field]) {
              logger.error(`${field} is required`)
              return res.status(400).send({
                error: { message: `Missing '${field}' in request body.` }
              })
            }
        }

        const { title, bookmark_url, description, rating } = req.body

        const ratingNum = Number(rating)

        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({
              error: { message: `'rating' must be a number between 0 and 5` }
            })
        }

        if (!isWebUri(bookmark_url)) {
            logger.error(`Invalid url '${bookmark_url}' supplied`)
            return res.status(400).send({
              error: { message: `'url' must be a valid URL` }
            })
        }

        const newBookmark = { title, bookmark_url, description, rating }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl,`/${bookmark.id}`))
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

bookmarksRouter
    .route('/:id')
    .all((req, res, next) => {
        const { id } = req.params
        const db = req.app.get('db')
        BookmarksService.getBookmarkById(db, id)
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark with ${id} not found.`)
                    return res 
                        .status(404)
                        .json({
                            error: { message: `Bookmark doesn't exist`}
                        })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, bookmark_url, description, rating } = req.body
        const bookmarkToUpdate = { title, bookmark_url, description, rating }

        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain either 'title', 'bookmark_url', 'description', or 'rating'`
                }
            })
        }

        BookmarksService.updateBookmarks(
            req.app.get('db'),
            req.params.id,
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter


