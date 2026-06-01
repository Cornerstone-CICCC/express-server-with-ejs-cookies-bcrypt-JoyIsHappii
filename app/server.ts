import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


// In-memory user storage (for demonstration purposes)
const users: { email: string; password: string }[] = [];
const findUserByEmail = (email: string): { email: string; password: string } | undefined => {
    return users.find(user => user.email === email);
};

//GET
//index route
app.get('/', (req, res) => {
    res.render('pages/index'); // Render the index.ejs template
});

//login route
app.get('/login', (req, res) => {
    res.render('pages/login'); // Render the login.ejs template
});

//register route
app.get('/register', (req, res) => {
    res.render('pages/register'); // Render the register.ejs template
});

//POST
// Handle registration form submission
app.post('/register', express.urlencoded({ extended: true }), (req, res) => {
    const { email, password } = req.body;
    if (findUserByEmail(email)) {
        return res.redirect(`/register`);
    }
    users.push({ email, password });
    res.redirect('/login');
});

// Handle login form submission
app.post('/login', express.urlencoded({ extended: true }), (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.redirect(`/login`);
  }
  res.redirect('/');
} 
);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});