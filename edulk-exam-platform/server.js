const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://dineshrk143_db_user:tLYswFz2mO4Sni3I@cluster0.mqxxnkv.mongodb.net";

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully.'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---
const studentSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: String,
    password: { type: String, required: true }
});
const Student = mongoose.model('Student', studentSchema);

const paperSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    grade: String,
    category: String,
    subcategory: String,
    title: String,
    videoUrl: String,
    duration: Number,
    questions: Array
});
const Paper = mongoose.model('Paper', paperSchema);

const resultSchema = new mongoose.Schema({
    studentName: String,
    paperTitle: String,
    score: Number,
    total: Number,
    percentage: Number,
    date: String
});
const Result = mongoose.model('Result', resultSchema);

// --- API ROUTES ---

// 1. Get all papers
app.get('/api/papers', async (req, res) => {
    try {
        const papers = await Paper.find();
        res.json(papers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Save or Update Paper (Admin)
app.post('/api/papers', async (req, res) => {
    try {
        const { id, grade, category, subcategory, title, videoUrl, duration, questions } = req.body;
        await Paper.findOneAndUpdate(
            { id },
            { grade, category, subcategory, title, videoUrl, duration, questions },
            { upsert: true, new: true }
        );
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Delete Paper
app.delete('/api/papers/:id', async (req, res) => {
    try {
        await Paper.findOneAndDelete({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Register Student
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;
        const newStudent = new Student({ username, email, phone, password });
        await newStudent.save();
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'Username or Email already exists.' });
    }
});

// 5. Login Student
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const student = await Student.findOne({
            $or: [{ username }, { email: username }],
            password
        });
        if (!student) return res.status(401).json({ error: 'Invalid credentials.' });
        res.json({ success: true, user: { username: student.username, role: 'student' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Save Exam Results
app.post('/api/results', async (req, res) => {
    try {
        const { studentName, paperTitle, score, total, percentage, date } = req.body;
        const newResult = new Result({ studentName, paperTitle, score, total, percentage, date });
        await newResult.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
