const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

app.use(cookieParser());

const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'your_database'
}, connection);

app.use(session({
  key: 'user_sid',
  secret: 'your_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 * 24 * 1000 // 1天
  }
}));

// 用户登录
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT uid FROM users WHERE username =? AND password =?';
  connection.query(query, [username, password], (error, results, fields) => {
    if (error) throw error;
    if (results.length === 0) {
      res.json({ message: 'Invalid credentials' });
    } else {
      req.session.uid = results[0].uid;
      res.json({ message: 'Login successful' });
    }
  });
});

// 用户注销
app.post('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
        res.json({ message: 'Logout failed' });
      } else {
        res.clearCookie('user_sid');
        res.json({ message: 'Logout successful' });
      }
    });
  }
});

// 内部API：根据Cookie查询用户UID
app.get('/uid', (req, res) => {
  if (req.session && req.session.uid) {
    res.json({ uid: req.session.uid });
  } else {
    res.json({ message: 'Not logged in' });
  }
});