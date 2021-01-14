function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Google',
            bookmark_url: 'http://www.google.com',
            description: 'A search engine with imense power.',
            rating: 4.0
        },
        {
            id: 2,
            title: 'Yahoo',
            bookmark_url: 'http://www.yahoo.com',
            description: 'A search engine with imense power.',
            rating: 2
        },
        {
            id: 3,
            title: 'Facebook',
            bookmark_url: 'http://www.facebook.com',
            description: 'A social media platform with imense power.',
            rating: 3
        }
    ]
}

function makeNewBookmark() {
    return {
            title: 'Netflix',
            bookmark_url: 'http://www.netflix.com',
            description: 'A video streamer with immense power',
            rating: 4
        }
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      bookmark_url: 'https://www.hackers.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      rating: 1,
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
}

module.exports = {makeBookmarksArray, makeNewBookmark, makeMaliciousBookmark}