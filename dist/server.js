import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ensureSchema, seedIfEmpty } from './db';
import { tasksRouter } from './routes/tasks';
import { booksRouter } from './routes/books';
import { loansRouter } from './routes/loans';
dotenv.config();
const app = express();
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.use('/api/tasks', tasksRouter);
app.use('/api/books', booksRouter);
app.use('/api/loans', loansRouter);
const PORT = parseInt(process.env.PORT || '3000', 10);
let tried = false;
const tryInit = async () => {
    try {
        await ensureSchema();
        await seedIfEmpty();
        tried = true;
        console.log('Database initialized and seeded');
    }
    catch (e) {
        console.error('Database init error', e);
    }
};
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
tryInit();
setInterval(() => { if (!tried)
    tryInit(); }, 5000);
