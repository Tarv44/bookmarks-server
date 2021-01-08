const BookmarksService = {
    getAllBookmarks(db) {
      return db('bookmarks')
        .select('*');
    },
  
    insertBookmark(db, data) {
      return db('bookmarks')
        .insert(data)
        .returning('*')
        .then(rows => rows[0]);
    },
  
    getBookmarkById(db, id) {
      return db('bookmarks')
        .select('*')
        .where({ id })
        .first();
    },
  
    deleteBookmark(db, id) {
      return db('bookmarks')
        .where({ id })
        .delete();
    },
  
    updateBookmarks(db, id, data) {
      return db('bookmarks')
        .where({ id })
        .update(data);
    }
};
  
module.exports = BookmarksService;