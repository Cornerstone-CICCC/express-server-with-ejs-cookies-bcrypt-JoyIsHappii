import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import cookieSession from 'cookie-session';
import type { Request, Response } from 'express';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: 'session',
    keys: ['secret-key'],
    maxAge: 24 * 60 * 60 * 1000
  })
);

// Type for session
declare module 'cookie-session' {
  interface CookieSessionObject {
    email?: string;
  }
}

// User DB (in-memory)
type User = {
  email: string;
  password: string;
};

const users: User[] = [];

const findUserByEmail = (email: string) => {
  return users.find((user) => user.email === email);
};

// =====================
// ROUTES
// =====================

app.get('/', (req, res) => {
  res.render('pages/index', {
    email: req.session?.email
  });
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// REGISTER
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.redirect('/register');
  }

  if (findUserByEmail(email)) {
    return res.redirect('/register');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    email,
    password: hashedPassword
  });

  res.redirect('/login');
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = findUserByEmail(email);

  if (!user) {
    return res.redirect('/login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.redirect('/login');
  }

  req.session!.email = user.email;

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});