# Staff Task Manager

A web-based task management system for staff members.

## Features

- View and manage tasks for different staff members
- Mark tasks as complete
- Add remarks to tasks
- Collapsible task view
- Automatic data persistence
- Offline support

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your GitHub configuration:
   ```
   GITHUB_TOKEN=your_github_token_here
   GITHUB_OWNER=your_github_username
   GITHUB_REPO=your_repo_name
   PORT=3000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Development

- Frontend files are in the `public` directory
- Backend server code is in `server.js`
- Task data is stored in `tasks.csv`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
