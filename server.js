import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Fix for __dirname (in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Path to users.json
const usersFile = path.join(__dirname, "db", "users.json");

// loadUsers() and saveUsers() can belater swapped for proper DB - sqlite/mongo/...

// Helper to load users
function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
}

// Helper to save users
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Route: Register
function isPasswordValid(pw) {
  const groups = [
    /[a-z]/.test(pw),      // lowercase
    /[A-Z]/.test(pw),      // uppercase
    /[0-9]/.test(pw),      // numbers
    /[^a-zA-Z0-9]/.test(pw) // special chars
  ];

  const groupCount = groups.filter(Boolean).length;

  if (pw.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  if (groupCount < 2) {
    return { valid: false, message: "Password must include at least 2 types: uppercase, lowercase, numbers, or special characters." };
  }
  return { valid: true };
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  // Username check
  if (users.find((u) => u.username === username)) {
    return res.json({ success: false, message: "Username already exists. Please choose another." });
  }

  // Password check (server-side)
  const pwCheck = isPasswordValid(password);
  if (!pwCheck.valid) {
    return res.json({ success: false, message: pwCheck.message });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save new user
  users.push({ username, passwordHash: hashedPassword });
  saveUsers(users);

  res.json({ success: true, message: "Registration successful! You can now log in." });
});




// Route: Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.send("User not found. <a href='/register.html'>Register here</a>");
  }

  // Compare password with hash
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.send("Invalid password. Try again.");
  }

  res.send("Login successful! 🎉 Welcome, " + username);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
