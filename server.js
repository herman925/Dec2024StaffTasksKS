const express = require('express');
const { Octokit } = require('@octokit/rest');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(express.json());
app.use(express.text());

// GitHub configuration
const GITHUB_CONFIG = {
    owner: process.env.GITHUB_OWNER || 'herman925',
    repo: process.env.GITHUB_REPO || 'Dec2024StaffTasksKS',
    path: 'tasks.csv',
    branch: 'main'
};

// Initialize Octokit
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Staff Task Manager API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        config: {
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            path: GITHUB_CONFIG.path
        }
    });
});

// Get tasks
app.get('/api/tasks', async (req, res) => {
    try {
        console.log('Fetching tasks from GitHub...');
        console.log('Using config:', {
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            path: GITHUB_CONFIG.path,
            ref: GITHUB_CONFIG.branch
        });

        const { data } = await octokit.repos.getContent({
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            path: GITHUB_CONFIG.path,
            ref: GITHUB_CONFIG.branch
        });

        console.log('Successfully fetched file from GitHub');
        const content = Buffer.from(data.content, 'base64').toString();
        console.log('Decoded content:', content.substring(0, 100) + '...');
        
        res.send(content);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            response: error.response?.data
        });
        
        if (error.status === 404) {
            res.status(404).send('Tasks file not found in repository');
        } else {
            res.status(500).send('Error fetching tasks: ' + error.message);
        }
    }
});

// Update tasks
app.post('/api/tasks', async (req, res) => {
    try {
        console.log('Updating tasks...');
        const { data: currentFile } = await octokit.repos.getContent({
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            path: GITHUB_CONFIG.path,
            ref: GITHUB_CONFIG.branch
        });

        console.log('Current file found, updating content...');
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: GITHUB_CONFIG.owner,
            repo: GITHUB_CONFIG.repo,
            path: GITHUB_CONFIG.path,
            message: 'Update tasks',
            content: Buffer.from(req.body).toString('base64'),
            sha: currentFile.sha,
            branch: GITHUB_CONFIG.branch
        });

        console.log('Tasks updated successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating tasks:', error);
        res.status(500).send('Error updating tasks: ' + error.message);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('GitHub Config:', {
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        path: GITHUB_CONFIG.path,
        branch: GITHUB_CONFIG.branch
    });
});
