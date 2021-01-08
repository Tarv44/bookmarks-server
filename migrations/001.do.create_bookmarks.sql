CREATE TABLE bookmarks (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    bookmark_url VARCHAR(2083) NOT NULL,
    description TEXT,
    rating INTEGER NOT NULL
);