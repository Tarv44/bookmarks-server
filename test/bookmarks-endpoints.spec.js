const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe(`Bookmarks Endpoints`, () => {
    let db

    before('knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context('Given no bookmarks', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and all bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [
                        {
                            id: 1,
                            ...testBookmarks[0]
                        },
                        {
                            id: 2,
                            ...testBookmarks[1]
                        },
                        {
                            id: 3,
                            ...testBookmarks[2]
                        }
                    ])
            })
        })
    })

    describe('GET /bookmarks/:id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const id = 9309321
                return supertest(app)
                    .get(`/bookmarks/${id}`)
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, 'Not found')
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it(`GET /bookmarks/:id responds with 200 and correct bookmark`, () => {
                const id = 2
                correctBookmark = testBookmarks[id - 1]

                return supertest(app)
                    .get(`/bookmarks/${id}`)
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, {
                        id,
                        ...correctBookmark
                    })
            })
        })
    })
})