const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBookmarksArray, makeNewBookmark, makeMaliciousBookmark } = require('./bookmarks.fixtures')

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

    describe(`Unauthorized requests`, () => {
        const testBookmarks = makeBookmarksArray()
    
        beforeEach('insert bookmarks', () => {
          return db
            .into('bookmarks')
            .insert(testBookmarks)
        })
    
        it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
          return supertest(app)
            .get('/bookmarks')
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
          return supertest(app)
            .post('/bookmarks')
            .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
          const secondBookmark = testBookmarks[1]
          return supertest(app)
            .get(`/bookmarks/${secondBookmark.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
    
        it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
          const aBookmark = testBookmarks[1]
          return supertest(app)
            .delete(`/bookmarks/${aBookmark.id}`)
            .expect(401, { error: 'Unauthorized request' })
        })
      })

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
                    .expect(200, testBookmarks)
            })
        })

        context(`Given an XSS attack bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
      
            beforeEach('insert malicious bookmark', () => {
              return db
                .into('bookmarks')
                .insert([maliciousBookmark])
            })
      
            it('removes XSS attack content', () => {
              return supertest(app)
                .get(`/bookmarks`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                  expect(res.body[0].title).to.eql(expectedBookmark.title)
                  expect(res.body[0].description).to.eql(expectedBookmark.description)
                })
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
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
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

        context(`Given an XSS attack bookmark`, () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
      
            beforeEach('insert malicious bookmark', () => {
              return db
                .into('bookmarks')
                .insert([maliciousBookmark])
            })
      
            it('removes XSS attack content', () => {
              return supertest(app)
                .get(`/bookmarks/${maliciousBookmark.id}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200)
                .expect(res => {
                  expect(res.body.title).to.eql(expectedBookmark.title)
                  expect(res.body.description).to.eql(expectedBookmark.description)
                })
            })
        })
    })
    describe('POST /bookmarks', () => {
        it('creates a bookmark, responds with new bookmark and 201 status', function() {
            this.retries(3)
            const newBookmark = makeNewBookmark()
            return supertest(app)
                .post('/bookmarks')
                .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.bookmark_url).to.eql(newBookmark.bookmark_url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')

                })
                .then(postRes => {
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        })
        
        it(`responds with 400 missing 'title' if not supplied`, () => {
            const newBookmarkMissingTitle = {
              // title: 'test-title',
              bookmark_url: 'https://test.com',
              rating: 1,
            }
            return supertest(app)
              .post(`/bookmarks`)
              .send(newBookmarkMissingTitle)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(400, {
                error: { message: "Missing 'title' in request body." }
              })
          })
      
          it(`responds with 400 missing 'url' if not supplied`, () => {
            const newBookmarkMissingUrl = {
              title: 'test-title',
              // url: 'https://test.com',
              rating: 1,
            }
            return supertest(app)
              .post(`/bookmarks`)
              .send(newBookmarkMissingUrl)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(400, {
                error: { message: "Missing 'bookmark_url' in request body." }
              })
          })
      
          it(`responds with 400 missing 'rating' if not supplied`, () => {
            const newBookmarkMissingRating = {
              title: 'test-title',
              bookmark_url: 'https://test.com',
              // rating: 1,
            }
            return supertest(app)
              .post(`/bookmarks`)
              .send(newBookmarkMissingRating)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(400, {
                error: { message: "Missing 'rating' in request body." }
              })
          })

        it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
            const newBookmarkInvalidRating = {
              title: 'test-title',
              bookmark_url: 'https://test.com',
              rating: 'invalid',
            }
            return supertest(app)
              .post(`/bookmarks`)
              .send(newBookmarkInvalidRating)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(400, {
                error: { message: `'rating' must be a number between 0 and 5` }
              })
        })

        it(`responds with 400 invalid 'url' if not a valid URL`, () => {
            const newBookmarkInvalidUrl = {
              title: 'test-title',
              bookmark_url: 'htp://invalid-url',
              rating: 1,
            }
            return supertest(app)
              .post(`/bookmarks`)
              .send(newBookmarkInvalidUrl)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(400, {
                error: { message: `'url' must be a valid URL` }
              })
        })

        it('removes XSS attack content from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
            return supertest(app)
              .post(`/bookmarks`)
              .send(maliciousBookmark)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(201)
              .expect(res => {
                expect(res.body.title).to.eql(expectedBookmark.title)
                expect(res.body.description).to.eql(expectedBookmark.description)
              })
        })
    })

    describe('DELETE /bookmarks/:id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const bookmarkId = 1234567
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })
        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })
    
            it('responds with 204 and removes the article', () => {
                const idToRemove = 2
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/bookmarks`)
                            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmarks)
                    )
            })
        })
    })
})