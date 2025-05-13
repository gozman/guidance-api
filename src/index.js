import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import instructionsService from './services/instructions-service.js';

// Load environment variables
config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Instructions API',
    endpoints: [
      {
        path: '/instructions',
        method: 'GET',
        description: 'Retrieve a list of instructions',
        query: {
          username: 'Username for login',
          password: 'Password for login'
        }
      },
      {
        path: '/instructions',
        method: 'POST',
        description: 'Create a new instruction',
        body: {
          username: 'Username for login',
          password: 'Password for login',
          title: 'Instruction title',
          content: 'Instruction content'
        }
      },
      {
        path: '/instructions/delete',
        method: 'POST',
        description: 'Delete an instruction',
        body: {
          username: 'Username for login',
          password: 'Password for login',
          title: 'Instruction title (optional - if not provided, all instructions will be deleted)'
        }
      }
    ]
  });
});

// Instruction endpoints
app.get('/instructions', async (req, res) => {
  try {
    let { username, password } = req.query;
    
    // Use default credentials from environment variables if not provided
    username = username || process.env.AUTH_USERNAME;
    password = password || process.env.AUTH_PASSWORD;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    console.log('Retrieving instructions...');
    const instructions = await instructionsService.getInstructions(username, password);
    
    return res.json({ success: true, data: instructions });
  } catch (error) {
    console.error('Error retrieving instructions:', error);
    return res.status(500).json({ 
      error: 'An error occurred while retrieving instructions',
      message: error.message 
    });
  }
});

app.post('/instructions', async (req, res) => {
  try {
    let { username, password, title, content } = req.body;
    
    // Use default credentials from environment variables if not provided
    username = username || process.env.AUTH_USERNAME;
    password = password || process.env.AUTH_PASSWORD;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (!title) {
      return res.status(400).json({ error: 'Instruction title is required' });
    }
    
    if (!content) {
      return res.status(400).json({ error: 'Instruction content is required' });
    }
    
    console.log(`Creating instruction "${title}"...`);
    const result = await instructionsService.createInstruction(username, password, title, content);
    
    return res.json(result);
  } catch (error) {
    console.error('Error creating instruction:', error);
    return res.status(500).json({ 
      error: 'An error occurred while creating the instruction',
      message: error.message 
    });
  }
});

app.post('/instructions/delete', async (req, res) => {
  try {
    let { username, password, title } = req.body;
    
    // Use default credentials from environment variables if not provided
    username = username || process.env.AUTH_USERNAME;
    password = password || process.env.AUTH_PASSWORD;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (title) {
      console.log(`Deleting instruction "${title}"...`);
      const result = await instructionsService.deleteInstruction(username, password, title);
      return res.json(result);
    } else {
      console.log('Deleting all instructions...');
      const result = await instructionsService.deleteAllInstructions(username, password);
      return res.json(result);
    }
  } catch (error) {
    console.error('Error deleting instruction:', error);
    return res.status(500).json({ 
      error: 'An error occurred while deleting the instruction',
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
