-- SQLite Schema for Book Recommendation System

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  genre TEXT NOT NULL,
  description TEXT,
  isbn TEXT UNIQUE,
  rating REAL DEFAULT 0.0,
  published_year INTEGER,
  page_count INTEGER,
  cover_image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create ratings table (for user book ratings)
CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
);

-- Insert sample books with various genres
INSERT OR IGNORE INTO books (title, author, genre, description, isbn, rating, published_year, page_count) VALUES
-- Classic Fiction
('To Kill a Mockingbird', 'Harper Lee', 'Classic Fiction', 'A gripping tale of racial injustice in the American South', '9780061120084', 4.8, 1960, 324),
('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic Fiction', 'A masterpiece of American literature', '9780743273565', 4.7, 1925, 180),
('Jane Eyre', 'Charlotte Brontë', 'Classic Fiction', 'A love story set in Victorian England', '9780141441146', 4.6, 1847, 432),
('Wuthering Heights', 'Emily Brontë', 'Classic Fiction', 'A dark tale of love and revenge', '9780141439556', 4.5, 1848, 352),
('Moby Dick', 'Herman Melville', 'Classic Fiction', 'The epic quest for the great white whale', '9780141439846', 4.3, 1851, 624),
('Great Expectations', 'Charles Dickens', 'Classic Fiction', 'A coming-of-age story in Victorian England', '9780141439563', 4.6, 1861, 505),
('The Odyssey', 'Homer', 'Classic Fiction', 'An ancient Greek epic of adventure and homecoming', '9780140268867', 4.4, -800, 656),

-- Contemporary Fiction
('The Catcher in the Rye', 'J.D. Salinger', 'Contemporary Fiction', 'The story of teenage rebellion and alienation', '9780316769174', 4.3, 1951, 277),
('The Bell Jar', 'Sylvia Plath', 'Contemporary Fiction', 'A portrait of a young woman''s mental breakdown', '9780061148514', 4.3, 1963, 278),
('Slaughterhouse-Five', 'Kurt Vonnegut', 'Contemporary Fiction', 'An anti-war novel set across time', '9780440180296', 4.5, 1969, 275),
('One Hundred Years of Solitude', 'Gabriel García Márquez', 'Contemporary Fiction', 'Magical realism in a small Colombian village', '9780060883287', 4.6, 1967, 422),
('The Midnight Library', 'Matt Haig', 'Contemporary Fiction', 'Exploring infinite possibilities in life', '9780525559474', 4.5, 2020, 304),

-- Romance
('Pride and Prejudice', 'Jane Austen', 'Romance', 'A tale of love, marriage, and social convention', '9780141439518', 4.7, 1813, 279),
('Outlander', 'Diana Gabaldon', 'Romance', 'A tale of time travel and forbidden love', '9780553212624', 4.6, 1991, 656),
('The Notebook', 'Nicholas Sparks', 'Romance', 'A touching love story across decades', '9780553382037', 4.5, 1996, 214),
('Me Before You', 'Jojo Moyes', 'Romance', 'A complex love story with difficult choices', '9780399576515', 4.4, 2012, 369),
('The Sun Also Rises', 'Ernest Hemingway', 'Romance', 'A lost generation in post-war Europe', '9780743297409', 4.3, 1926, 251),

-- Fantasy
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'An epic fantasy adventure across Middle-earth', '9780544003415', 4.9, 1954, 1178),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'A hobbit adventure to the Lonely Mountain', '9780547928227', 4.8, 1937, 310),
('Harry Potter and the Philosophers Stone', 'J.K. Rowling', 'Fantasy', 'The beginning of a magical journey', '9780747532699', 4.8, 1997, 223),
('A Game of Thrones', 'George R.R. Martin', 'Fantasy', 'An epic tale of power and intrigue', '9780553103540', 4.7, 1996, 694),
('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'The story of a legendary magician', '9780575081406', 4.7, 2007, 662),
('The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', 'C.S. Lewis', 'Fantasy', 'A magical world through the back of a wardrobe', '9780066472409', 4.6, 1950, 208),
('Percy Jackson and the Olympians: The Lightning Thief', 'Rick Riordan', 'Fantasy', 'A modern twist on Greek mythology', '9780786856299', 4.6, 2005, 375),

-- Science Fiction
('1984', 'George Orwell', 'Science Fiction', 'A haunting vision of a totalitarian future', '9780451524935', 4.6, 1949, 328),
('Dune', 'Frank Herbert', 'Science Fiction', 'An epic sci-fi novel of politics and power', '9780441172719', 4.7, 1965, 496),
('The Martian', 'Andy Weir', 'Science Fiction', 'Survival on Mars with ingenuity and humor', '9780553418026', 4.7, 2011, 369),
('Foundation', 'Isaac Asimov', 'Science Fiction', 'The fall and rise of a galactic empire', '9780553293357', 4.6, 1951, 255),
('Neuromancer', 'William Gibson', 'Science Fiction', 'The birth of cyberpunk fiction', '9780441569595', 4.5, 1984, 271),
('The Time Machine', 'H.G. Wells', 'Science Fiction', 'A journey through time to the distant future', '9780486284720', 4.3, 1895, 118),

-- Dystopian
('Brave New World', 'Aldous Huxley', 'Dystopian', 'A vision of a futuristic pleasure-seeking society', '9780060085376', 4.5, 1932, 268),
('Fahrenheit 451', 'Ray Bradbury', 'Dystopian', 'A future where books are burned', '9781451673265', 4.6, 1953, 227),
('The Handmaids Tale', 'Margaret Atwood', 'Dystopian', 'A dark vision of a totalitarian theocracy', '9780385490818', 4.7, 1985, 395),

-- Mystery & Thriller
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'Mystery', 'A gripping Swedish crime thriller', '9780307454546', 4.6, 2005, 465),
('Gone Girl', 'Gillian Flynn', 'Mystery', 'A twisted tale of marriage and deception', '9780307588371', 4.5, 2012, 422),
('The Da Vinci Code', 'Dan Brown', 'Mystery', 'A puzzle spanning art, history, and religion', '9780307474278', 4.5, 2003, 689),
('And Then There Were None', 'Agatha Christie', 'Mystery', 'A locked-room mystery with a twist', '9780062073556', 4.7, 1939, 272),
('The Murder of Roger Ackroyd', 'Agatha Christie', 'Mystery', 'A classic detective story with a shocking ending', '9780062693778', 4.6, 1926, 312),

-- Historical Fiction
('All the Light We Cannot See', 'Anthony Doerr', 'Historical Fiction', 'A WWII love story between enemies', '9780553418026', 4.7, 2014, 544),
('The Book Thief', 'Markus Zusak', 'Historical Fiction', 'Story of a girl who steals books in Nazi Germany', '9780375831003', 4.6, 2005, 552),
('Pillars of the Earth', 'Ken Follett', 'Historical Fiction', 'A cathedral and the people who build it', '9780688047726', 4.6, 1989, 973),
('The Nightingale', 'Kristin Hannah', 'Historical Fiction', 'Sisters in occupied France during WWII', '9780312577223', 4.7, 2015, 440),

-- Adventure
('Treasure Island', 'Robert Louis Stevenson', 'Adventure', 'A classic tale of pirates and buried treasure', '9780141439587', 4.5, 1881, 282),
('The Adventure of the Sherlock Holmes', 'Arthur Conan Doyle', 'Adventure', 'Detective stories set in Victorian London', '9780141435510', 4.6, 1892, 456),
('Around the World in Eighty Days', 'Jules Verne', 'Adventure', 'A race around the globe', '9780141439624', 4.4, 1873, 298),

-- Horror
('Frankenstein', 'Mary Shelley', 'Horror', 'A gothic tale of science and creation', '9780141439471', 4.3, 1818, 280),
('Dracula', 'Bram Stoker', 'Horror', 'The classic vampire novel', '9780141439846', 4.5, 1897, 418),
('The Shining', 'Stephen King', 'Horror', 'Madness and terror in an isolated hotel', '9780385333312', 4.6, 1977, 447),
('It', 'Stephen King', 'Horror', 'A group battles an ancient evil', '9781501192272', 4.5, 1986, 1138),

-- Philosophy & Non-Fiction (Novels)
('The Brothers Karamazov', 'Fyodor Dostoevsky', 'Philosophical Fiction', 'A profound exploration of faith and doubt', '9780374528379', 4.7, 1879, 796),
('Crime and Punishment', 'Fyodor Dostoevsky', 'Philosophical Fiction', 'A student grapples with morality and guilt', '9780486415871', 4.6, 1866, 671),
('The Stranger', 'Albert Camus', 'Philosophical Fiction', 'An absurdist tale of alienation', '9780679720201', 4.3, 1942, 123),

-- General Fiction
('The Remains of the Day', 'Kazuo Ishiguro', 'Fiction', 'A butler reflects on duty and lost love', '9780571160532', 4.5, 1989, 258),
('Never Let Me Go', 'Kazuo Ishiguro', 'Fiction', 'A haunting story of friendship and fate', '9780375414435', 4.4, 2005, 281),
('Norwegian Wood', 'Haruki Murakami', 'Fiction', 'A coming-of-age love story in Tokyo', '9780099448051', 4.4, 1987, 608),
('Kafka on the Shore', 'Haruki Murakami', 'Fiction', 'A surreal tale of two parallel stories', '9780099458487', 4.4, 2002, 645),
('The Kite Runner', 'Khaled Hosseini', 'Fiction', 'Friendship, redemption, and Afghanistan', '9781594480003', 4.6, 2003, 365),
('A Thousand Splendid Suns', 'Khaled Hosseini', 'Fiction', 'Two women''s lives in war-torn Afghanistan', '9781594491733', 4.6, 2007, 494),
('Life of Pi', 'Yann Martel', 'Fiction', 'A spiritual journey on the ocean', '9780156005005', 4.6, 2001, 460),
('The Alchemist', 'Paulo Coelho', 'Fiction', 'A shepherd boy''s journey to find his dream', '9780062315007', 4.6, 1988, 224),
('Sapiens', 'Yuval Noah Harari', 'Fiction', 'A narrative history of humankind', '9780062316097', 4.7, 2011, 465),
('Memoirs of a Geisha', 'Arthur Golden', 'Fiction', 'The enchanting world of a Japanese geisha', '9780375408120', 4.5, 1997, 449),
('The Shadow of the Wind', 'Carlos Ruiz Zafón', 'Fiction', 'A mystery set in post-war Barcelona', '9780143039990', 4.5, 2001, 487),
('All the Light We Cannot See', 'Anthony Doerr', 'Fiction', 'Beauty amid the horror of war', '9780553418026', 4.7, 2014, 544),

-- Non-Fiction: Biography & Memoir
('Becoming', 'Michelle Obama', 'Non-Fiction', 'The memoir of the former First Lady of the USA', '9781524763138', 4.7, 2018, 426),
('The Story of My Life', 'Helen Keller', 'Non-Fiction', 'An inspiring autobiography of overcoming adversity', '9780486298022', 4.6, 1903, 309),
('Long Walk to Freedom', 'Nelson Mandela', 'Non-Fiction', 'The autobiography of the South African leader', '9780316769174', 4.8, 1994, 751),
('I Am Malala', 'Malala Yousafzai', 'Non-Fiction', 'A girl''s fight for education in Pakistan', '9780297870951', 4.7, 2013, 352),
('Unbroken', 'Laura Hillenbrand', 'Non-Fiction', 'An Olympic runner''s survival story in WWII', '9780812982541', 4.8, 2010, 521),
('Steve Jobs', 'Walter Isaacson', 'Non-Fiction', 'The biography of Apple''s visionary founder', '9781451648539', 4.6, 2011, 656),
('Leonardo da Vinci', 'Walter Isaacson', 'Non-Fiction', 'The genius of the Renaissance master', '9781501139030', 4.6, 2017, 624),
('The Immortal Life of Henrietta Lacks', 'Rebecca Skloot', 'Non-Fiction', 'The woman behind medical breakthroughs', '9780375528002', 4.7, 2010, 381),
('A Brief History of Time', 'Stephen Hawking', 'Non-Fiction', 'Understanding the universe and black holes', '9780553380163', 4.5, 1988, 212),
('Educated', 'Tara Westover', 'Non-Fiction', 'A memoir of a girl who leaves survivalism for education', '9780399590504', 4.7, 2018, 334),

-- Non-Fiction: Self-Help & Personal Development
('Atomic Habits', 'James Clear', 'Non-Fiction', 'Building better habits through small changes', '9780735211292', 4.8, 2018, 320),
('The 7 Habits of Highly Effective People', 'Stephen Covey', 'Non-Fiction', 'Principles for personal and professional success', '9781442369665', 4.7, 1989, 432),
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Non-Fiction', 'Insights into how we make decisions', '9780374533557', 4.6, 2011, 499),
('How to Win Friends and Influence People', 'Dale Carnegie', 'Non-Fiction', 'Timeless advice on communication and relationships', '9780671027032', 4.7, 1936, 291),
('The Power of Now', 'Eckhart Tolle', 'Non-Fiction', 'A spiritual guide to living in the present moment', '9781577314806', 4.6, 1997, 236),
('Mindset: The New Psychology of Success', 'Carol S. Dweck', 'Non-Fiction', 'How a growth mindset unlocks achievement', '9780345472328', 4.7, 2006, 276),

-- Non-Fiction: Science & Nature
('The Selfish Gene', 'Richard Dawkins', 'Non-Fiction', 'A revolutionary look at evolution', '9780192860925', 4.6, 1976, 224),
('Cosmos', 'Carl Sagan', 'Non-Fiction', 'A journey through space and time', '9780345331433', 4.7, 1980, 953),
('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 'A brief history of humankind', '9780062316097', 4.7, 2011, 465),
('The Sixth Extinction', 'Elizabeth Kolbert', 'Non-Fiction', 'Why species are disappearing at alarming rates', '9780805092998', 4.6, 2014, 310),
('Braiding Sweetgrass', 'Robin Wall Kimmerer', 'Non-Fiction', 'Indigenous wisdom and botanical knowledge', '9781553898801', 4.7, 2013, 386),

-- Non-Fiction: History
('Guns, Germs, and Steel', 'Jared Diamond', 'Non-Fiction', 'Why some civilizations conquered others', '9780393354324', 4.6, 1997, 544),
('A People''s History of the United States', 'Howard Zinn', 'Non-Fiction', 'History from the perspective of common people', '9780062397348', 4.7, 1980, 688),
('The Story of Civilization', 'Will Durant', 'Non-Fiction', 'An epic narrative of human history', '9780743206357', 4.6, 1935, 554),
('1491: New Revelations of the Americas', 'Charles C. Mann', 'Non-Fiction', 'Understanding pre-Columbian America', '9780307275172', 4.6, 2005, 641),
('The Silk Roads', 'Peter Frankopan', 'Non-Fiction', 'A history of trade and cultural exchange', '9781101912820', 4.6, 2015, 651),

-- Non-Fiction: Business & Economics
('The Lean Startup', 'Eric Ries', 'Non-Fiction', 'Building startups through validated learning', '9780307887894', 4.5, 2011, 336),
('Good to Great', 'Jim Collins', 'Non-Fiction', 'Why some companies leap ahead', '9780066620992', 4.6, 2001, 300),
('Capital in the Twenty-First Century', 'Thomas Piketty', 'Non-Fiction', 'Understanding wealth inequality', '9780674430006', 4.5, 2013, 645),
('The Innovators', 'Walter Isaacson', 'Non-Fiction', 'How digital revolution was created', '9781476708690', 4.6, 2014, 658),
('Zero to One', 'Peter Thiel', 'Non-Fiction', 'Notes on startups and how to build the future', '9780804139298', 4.6, 2014, 195),

-- Non-Fiction: Philosophy & Religion
('A Brief History of Nearly Everything', 'Bill Bryson', 'Non-Fiction', 'The wonders of the natural world', '9780767908185', 4.7, 2003, 687),
('The God Delusion', 'Richard Dawkins', 'Non-Fiction', 'A critique of religious faith', '9780618918249', 4.3, 2006, 406),
('Man''s Search for Meaning', 'Viktor Frankl', 'Non-Fiction', 'Finding purpose in suffering', '9780807014271', 4.7, 1946, 165),
('The Republic', 'Plato', 'Non-Fiction', 'Ancient philosophical dialogues on justice', '9780140449143', 4.5, -380, 416),

-- Non-Fiction: Psychology
('The Psychology of Influence', 'Robert Cialdini', 'Non-Fiction', 'How persuasion shapes human behavior', '9780061241895', 4.7, 1984, 320),
('Flow: The Psychology of Optimal Experience', 'Mihaly Csikszentmihalyi', 'Non-Fiction', 'The secret to happiness and fulfillment', '9780061339202', 4.6, 1990, 336),
('Emotional Intelligence', 'Daniel Goleman', 'Non-Fiction', 'Why EQ matters more than IQ', '9780553382037', 4.5, 1995, 384),

-- Historical Romance
('The Nightingale', 'Kristin Hannah', 'Historical Romance', 'Sisters'' love and sacrifice in occupied France during WWII', '9780312577223', 4.7, 2015, 440),
('All the Light We Cannot See', 'Anthony Doerr', 'Historical Romance', 'A love story between enemies amid WWII chaos', '9780553418026', 4.7, 2014, 544),
('Outlander', 'Diana Gabaldon', 'Historical Romance', 'Epic time-travel romance spanning centuries', '9780553212624', 4.6, 1991, 656),
('The Bronze Horseman', 'Paullina Simons', 'Historical Romance', 'Passionate love during the siege of Leningrad', '9780061227271', 4.7, 1999, 566),
('The Other Boleyn Girl', 'Philippa Gregory', 'Historical Romance', 'The untold story of Mary Boleyn', '9780743245547', 4.5, 2001, 446),
('Wolf Hall', 'Hilary Mantel', 'Historical Romance', 'The rise of Thomas Cromwell in Tudor England', '9780805084092', 4.5, 2009, 656),
('The Shadow of the Wind', 'Carlos Ruiz Zafón', 'Historical Romance', 'A mystery and love story in post-war Barcelona', '9780143039990', 4.5, 2001, 487),
('The Time Traveler''s Wife', 'Audrey Niffenegger', 'Historical Romance', 'A love story complicated by time travel', '9780743246728', 4.5, 2003, 546),
('The Book of Lost Friends', 'Lisa Wingate', 'Historical Romance', 'Love and redemption in post-Civil War Louisiana', '9780553394535', 4.6, 2020, 496),
('Lonesome Dove', 'Larry McMurtry', 'Historical Romance', 'An epic Western tale of love and adventure', '9780743273565', 4.7, 1985, 945),
('The Snow Leopard', 'Peter Matthiessen', 'Historical Romance', 'A spiritual journey in the Himalayas', '9780140043525', 4.6, 1978, 338),
('Sense and Sensibility', 'Jane Austen', 'Historical Romance', 'Two sisters navigate love and society in Regency England', '9780141439662', 4.5, 1811, 409),
('The Pillars of the Earth', 'Ken Follett', 'Historical Romance', 'Love and ambition amid medieval cathedral building', '9780688047726', 4.6, 1989, 973),
('Beloved', 'Toni Morrison', 'Historical Romance', 'A haunting tale of a former slave and her past', '9781400033416', 4.5, 1987, 324),
('Jane Eyre', 'Charlotte Brontë', 'Historical Romance', 'A governess finds love and independence in Victorian England', '9780141441146', 4.6, 1847, 432),
('Wuthering Heights', 'Emily Brontë', 'Historical Romance', 'A passionate but dark tale of love on the Yorkshire moors', '9780141439556', 4.5, 1848, 352),
('The Scarlet Letter', 'Nathaniel Hawthorne', 'Historical Romance', 'Passion and scandal in Puritan New England', '9780141439654', 4.4, 1850, 320),
('Far from the Madding Crowd', 'Thomas Hardy', 'Historical Romance', 'Rural life and love in Victorian Wessex', '9780141439051', 4.5, 1874, 480),
('Rebecca', 'Daphne du Maurier', 'Historical Romance', 'Mystery and obsession in a grand English mansion', '9780380730377', 4.5, 1938, 449),
('The Wedding Gift', 'Cara Connelly', 'Historical Romance', 'Two people brought together by fate at a grand estate', '9780062024091', 4.4, 2012, 400),
('These Is My Words', 'Arizona Highways', 'Historical Romance', 'A woman''s diary spanning the Arizona frontier', '9780312427276', 4.6, 1988, 505),
('The Dovekeepers', 'Alice Hoffman', 'Historical Romance', 'Love and survival during the siege of Masada', '9781501126789', 4.6, 2011, 480),
('Lady Windermere''s Fan', 'Oscar Wilde', 'Historical Romance', 'Society secrets and love in Victorian London', '9780141441542', 4.3, 1892, 160),
('Vanity Fair', 'William Makepeace Thackeray', 'Historical Romance', 'A ambitious woman navigates Regency society', '9780141439761', 4.4, 1848, 848),
('The Tenant of Wildfell Hall', 'Anne Brontë', 'Historical Romance', 'A woman defies convention for love and freedom', '9780141439663', 4.5, 1848, 464);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
