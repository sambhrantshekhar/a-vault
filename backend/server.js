const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const recheckRoutes = require('./routes/recheckRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use(cors());
app.use(express.json());

// Serve uploads folder statically
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/rechecks', recheckRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'A-Vault API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
