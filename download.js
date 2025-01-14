// 查询可用积分
app.get('/points/:uid', (req, res) => {
    const { uid } = req.params;
    const query = 'SELECT points FROM users WHERE uid =?';
    connection.query(query, [uid], (error, results, fields) => {
      if (error) throw error;
      res.json({ points: results[0].points });
    });
  });
  
  // 查询下载过的资源UUID
  app.get('/downloads/:uid', (req, res) => {
    const { uid } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const query = 'SELECT uuid FROM downloads WHERE uid =? LIMIT? OFFSET?';
    connection.query(query, [uid, limit, offset], (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  });
  
  // 消耗积分购买资源
  app.post('/buy/:uid/:uuid', (req, res) => {
    const { uid, uuid } = req.params;
    connection.beginTransaction((error) => {
      if (error) throw error;
      const checkPointsQuery = 'SELECT points FROM users WHERE uid =?';
      connection.query(checkPointsQuery, [uid], (error, results, fields) => {
        if (error) {
          connection.rollback();
          throw error;
        }
        const userPoints = results[0].points;
        const contentQuery = 'SELECT points FROM contents WHERE uuid =?';
        connection.query(contentQuery, [uuid], (error, results, fields) => {
          if (error) {
            connection.rollback();
            throw error;
          }
          const contentPoints = results[0].points;
          if (userPoints < contentPoints) {
            connection.rollback();
            res.json({ message: 'Insufficient points' });
          } else {
            const updatePointsQuery = 'UPDATE users SET points = points -? WHERE uid =?';
            connection.query(updatePointsQuery, [contentPoints, uid], (error, results, fields) => {
              if (error) {
                connection.rollback();
                throw error;
              }
              const insertDownloadQuery = 'INSERT INTO downloads (uid, uuid) VALUES (?,?)';
              connection.query(insertDownloadQuery, [uid, uuid], (error, results, fields) => {
                if (error) {
                  connection.rollback();
                  throw error;
                }
                connection.commit((error) => {
                  if (error) throw error;
                  res.json({ message: 'Purchase successful' });
                });
              });
            });
          }
        });
      });
    });
  });
  
  // 请求下载链接
  app.get('/download/:uid/:uuid', (req, res) => {
    const { uid, uuid } = req.params;
    const query = 'SELECT * FROM downloads WHERE uid =? AND uuid =?';
    connection.query(query, [uid, uuid], (error, results, fields) => {
      if (error) throw error;
      if (results.length === 0) {
        res.json({ message: 'Resource not purchased' });
      } else {
        const contentQuery = 'SELECT file_url FROM contents WHERE uuid =?';
        connection.query(contentQuery, [uuid], (error, results, fields) => {
          if (error) throw error;
          res.json({ downloadUrl: results[0].file_url });
        });
      }
    });
  });