BEGIN;

INSERT INTO bookmarks (title, bookmark_url, description, rating)
VALUES
    ('Google', 'www.google.com', 'Search engine', 2),
    ('Yahoo', 'www.yahoo.com', 'Search engine',4),
    ('Facebook', 'www.facebook.com', 'Social media platform',3),
    ('Twitter', 'www.twitter.com', 'Social media platform',4),
    ('YouTube', 'www.youtube.com', 'Video streaming platform',2),
    ('Hulu', 'www.hulu.com', 'Video streaming platform',1),
    ('Netflix', 'www.netflix.com', 'Video streaming platform',3),
    ('Zillow', 'www.zillow.com', 'Real Estate platform',4),
    ('Instagram', 'www.instagram.com', 'Social media platform',2),
    ('HBO Max', 'www.hbomax.com', 'Video streaming platform',4);
COMMIT;