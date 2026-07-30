const express = require('express');
const cors = require('cors');
const path = require('path');

const styleRoutes = require('./routes/style.routes');
const authRoutes = require('./routes/auth.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const moodboardRoutes = require('./routes/moodboard.routes');
const quizRoutes = require("./routes/quiz.routes");
const categoryRoutes = require('./routes/categoryRoutes');
const interiorRoutes = require('./routes/interiorRoutes');
const adminRoutes = require("./routes/admin.routes");
const searchRoutes = require('./routes/search.routes');
const assistantRoutes = require("./routes/assistant.routes");
const projectRoutes = require('./routes/project.routes');
const projectTaskRoutes = require("./routes/projectTask.routes");
const projectInspirationRoutes = require("./routes/projectInspiration.routes");
const moviehouseRoutes = require("./routes/moviehouse.routes");
const designerRoutes = require('./routes/designer.routes');
const roomRoutes = require('./routes/room.routes');
const storyRoutes = require('./routes/story.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/assistant', assistantRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/project-tasks", projectTaskRoutes);
app.use("/api/project-inspirations", projectInspirationRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Nestify API is running' });
});


app.use('/api/projects', projectRoutes);
app.use('/api/styles', styleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/moodboards', moodboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/interiors', interiorRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/movie-houses', moviehouseRoutes);
app.use('/api/designers', designerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/stories', storyRoutes);
module.exports = app;
