// Staff data structure with positions
const staffData = {
    'Herman': { position: 'SRA', tasks: [] },
    'Alvin': { position: 'PA', tasks: [] },
    'Vicky': { position: 'RA', tasks: [] },
    'Echo': { position: 'SRA', tasks: [] },
    'Dickson': { position: 'SRA', tasks: [] },
    'Vincent': { position: 'PA', tasks: [] },
    'Archie': { position: 'RA', tasks: [] },
    'Jady': { position: 'RA', tasks: [] },
    'Kaka': { position: 'RA', tasks: [] },
    'Jane': { position: 'RA', tasks: [] },
    'Cathy': { position: 'RA', tasks: [] }
};

// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return entry;
    });
}

// Function to toggle task details
function toggleTaskDetails(taskElement) {
    taskElement.classList.toggle('expanded');
}

// Function to generate CSV content
function generateCSVContent() {
    let csvContent = "staff,position,taskId,taskText,taskDescription,completed,remarks\n";
    Object.entries(staffData).forEach(([staff, data]) => {
        data.tasks.forEach(task => {
            // Properly escape fields that might contain commas or quotes
            const escapedText = task.text.includes(',') ? `"${task.text}"` : task.text;
            const escapedDesc = task.description.includes(',') ? `"${task.description}"` : task.description;
            const escapedRemarks = task.remarks.includes(',') ? `"${task.remarks}"` : task.remarks;
            
            csvContent += `${staff},${data.position},${task.id},${escapedText},${escapedDesc},${task.completed},${escapedRemarks}\n`;
        });
    });
    return csvContent;
}

// GitHub configuration
const REPO_OWNER = 'herman925';
const REPO_NAME = 'Dec2024StaffTasksKS';

// Function to save tasks to GitHub
async function saveTasksToCSV() {
    try {
        // Save to localStorage as backup
        localStorage.setItem('staffTasks', JSON.stringify(staffData));
        
        // Generate CSV content
        const csvContent = generateCSVContent();
        
        // Create a new GitHub issue with the CSV content
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                title: 'Update Tasks',
                body: '```csv\n' + csvContent + '\n```\nPlease update tasks.csv with this content.'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create GitHub issue');
        }

        console.log('Changes saved to GitHub issue');
        alert('Changes have been submitted as a GitHub issue. An administrator will review and update the tasks.');
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        alert('Failed to save changes to GitHub. Your changes are saved locally.');
    }
}

// Function to load tasks from GitHub
async function loadTasksFromCSV() {
    try {
        console.log('Loading tasks from GitHub...');
        const response = await fetch('https://raw.githubusercontent.com/herman925/Dec2024StaffTasksKS/main/tasks.csv');
        
        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }
        
        const csvText = await response.text();
        const tasks = parseCSV(csvText);
        
        // Reset all tasks
        Object.values(staffData).forEach(staff => staff.tasks = []);
        
        // Populate tasks
        tasks.forEach(task => {
            if (staffData[task.staff]) {
                staffData[task.staff].tasks.push({
                    id: parseInt(task.taskId),
                    text: task.taskText,
                    description: task.taskDescription,
                    completed: task.completed === 'true',
                    remarks: task.remarks
                });
            }
        });
        
        // Save to localStorage as backup
        localStorage.setItem('staffTasks', JSON.stringify(staffData));
        
        // Update display if a staff member is selected
        const staffSelect = document.getElementById('staffSelect');
        if (staffSelect.value) {
            displayTasks(staffSelect.value);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        
        // Try to load from localStorage as fallback
        const savedTasks = localStorage.getItem('staffTasks');
        if (savedTasks) {
            const tasksData = JSON.parse(savedTasks);
            Object.entries(tasksData).forEach(([staff, data]) => {
                if (staffData[staff]) {
                    staffData[staff].position = data.position;
                    staffData[staff].tasks = data.tasks;
                }
            });
            
            // Display tasks for currently selected staff member
            const selectedStaff = document.getElementById('staffSelect').value;
            if (selectedStaff) {
                displayTasks(selectedStaff);
            }
        }
    }
}

// Function to display tasks for selected staff member
function displayTasks(staffName) {
    const taskList = document.getElementById('taskList');
    const staffInfo = document.getElementById('staffInfo');
    taskList.innerHTML = '';
    staffInfo.innerHTML = '';

    if (!staffName || !staffData[staffName]) {
        taskList.innerHTML = '<p>Please select a staff member</p>';
        return;
    }

    // Display staff name and position
    staffInfo.innerHTML = `
        <div class="staff-name">${staffName}</div>
        <div class="staff-position">${staffData[staffName].position}</div>
    `;

    staffData[staffName].tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.innerHTML = `
            <div class="task-header" onclick="toggleTaskDetails(this.parentElement)">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onclick="event.stopPropagation()"
                    onchange="toggleTask('${staffName}', ${task.id})">
                <div class="task-content">
                    <div class="task-title">
                        ${task.text}
                        <span class="expand-icon">▼</span>
                    </div>
                    <div class="task-details">
                        <div class="task-description">${task.description}</div>
                        <label class="remarks-label">Remarks:</label>
                        <textarea class="remarks" placeholder="Add remarks here..."
                            onclick="event.stopPropagation()"
                            onchange="updateRemarks('${staffName}', ${task.id}, this.value)">${task.remarks}</textarea>
                    </div>
                </div>
            </div>
        `;
        taskList.appendChild(taskDiv);
    });
}

// Function to toggle task completion
async function toggleTask(staffName, taskId) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        await saveTasksToCSV();
        displayTasks(staffName);
    }
}

// Function to update remarks
async function updateRemarks(staffName, taskId, remarks) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (task) {
        task.remarks = remarks;
        await saveTasksToCSV();
    }
}

// Initialize token input when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load tasks when the page loads
    loadTasksFromCSV();
    
    document.getElementById('staffSelect').addEventListener('change', (e) => {
        displayTasks(e.target.value);
    });
});
