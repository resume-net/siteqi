app.use(express.json());

// 接收JSON POST请求
app.post('/content', (req, res) => {
  const { title, content, uuid, points, imageUrl, fileUrl, school } = req.body;

  // 存储文本内容到SQL
  const contentQuery = 'INSERT INTO contents (title, content, uuid, points, image_url, file_url, school) VALUES (?,?,?,?,?,?,?)';
  connection.query(contentQuery, [title, content, uuid, points, imageUrl, fileUrl, school], (error, results, fields) => {
    if (error) throw error;
    res.json({ message: 'Content stored successfully' });
  });
});

// 按学校检索内容
app.get('/content/school/:school', (req, res) => {
  const { school } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  const query = 'SELECT * FROM contents WHERE school =? LIMIT? OFFSET?';
  connection.query(query, [school, limit, offset], (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// 按关键字检索内容
app.get('/content/search/:keyword', (req, res) => {
  const { keyword } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  const query = 'SELECT * FROM contents WHERE title LIKE? OR content LIKE? LIMIT? OFFSET?';
  connection.query(query, [`%${keyword}%`, `%${keyword}%`, limit, offset], (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// 根据UUID查看资源内容
app.get('/content/uuid/:uuid', (req, res) => {
  const { uuid } = req.params;
  const query = 'SELECT title, content, points, image_url FROM contents WHERE uuid =?';
  connection.query(query, [uuid], (error, results, fields) => {
    if (error) throw error;
    res.json(results[0]);
  });
});