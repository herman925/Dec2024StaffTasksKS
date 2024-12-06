# Pre-Christmas 2024 Chase Down

A festive web-based task management system for tracking staff tasks during the pre-Christmas period.

## Features

- **Staff Selection**: Choose from multiple staff members including SRAs, PAs, and RAs
- **Interactive Task Management**:
  - View individual tasks for each staff member
  - Mark tasks as complete with checkboxes
  - Add and edit remarks for each task
  - Detailed task view in a modal window
- **User Interface**:
  - Festive Christmas theme with snowflakes animation
  - Intuitive task cards with Christmas icons
  - Responsive design for all screen sizes
- **Data Management**:
  - Local storage support for task data
  - OneDrive integration for task loading and saving
  - Automatic save notifications
  - Task data persistence between sessions

## File Structure

- `index.html` - Main application interface
- `script.js` - Core application logic and functionality
- `styles.css` - Styling and animations
- `tasks.json` - Task data storage

## Usage

1. Open `index.html` in a web browser
2. Select a staff member from the dropdown menu
3. View and manage their assigned tasks
4. Click on a task to view/edit details and remarks
5. Use the checkbox to mark tasks as complete
6. Changes are automatically saved

## Technical Details

- Built with vanilla JavaScript for lightweight performance
- Uses modern CSS features for styling and animations
- Implements Font Awesome icons for visual elements
- Integrates Google Fonts for typography
- Responsive design using CSS Flexbox

## Data Structure

Tasks are organized by staff member in the following structure:
```json
{
  "staff": {
    "[Staff Name]": {
      "position": "[Position]",
      "tasks": [
        {
          "id": 1,
          "text": "Task description",
          "description": "Detailed task description",
          "completed": false,
          "remarks": ""
        }
      ]
    }
  }
}
