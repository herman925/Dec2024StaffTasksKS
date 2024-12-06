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

// Function to get OneDrive path
function getOneDrivePath() {
    let path = localStorage.getItem('onedrivePath');
    if (!path) {
        // Common OneDrive paths
        const commonPaths = [
            'C:\\Users\\' + (process.env.USERNAME || '') + '\\OneDrive',
            'C:\\Users\\' + (process.env.USERNAME || '') + '\\OneDrive - The Education University of Hong Kong',
            'D:\\OneDrive',
            'D:\\OneDrive - The Education University of Hong Kong',
            'E:\\OneDrive',
            'E:\\OneDrive - The Education University of Hong Kong'
        ];

        path = prompt(
            'Please enter your OneDrive root folder path. Common paths are:\n' + 
            commonPaths.join('\n') + 
            '\n\nThe rest of the path will be automatically appended:\n' +
            '\\The Education University of Hong Kong\\o365grp_KeySteps@JC - General\\00 - Project Admin\\Summary of Team Task\\Dec 2024 Pre-Christmas Tasks',
            commonPaths[0]
        );

        if (path) {
            localStorage.setItem('onedrivePath', path);
        }
    }
    return path ? path + '\\The Education University of Hong Kong\\o365grp_KeySteps@JC - General\\00 - Project Admin\\Summary of Team Task\\Dec 2024 Pre-Christmas Tasks' : null;
}

// Function to save tasks
async function saveTasksToCSV() {
    try {
        // Save to localStorage as backup
        localStorage.setItem('staffTasks', JSON.stringify(staffData));
        
        // Generate CSV content
        const csvContent = generateCSVContent();
        
        // Create a temporary element to trigger file download
        const element = document.createElement('a');
        const file = new Blob([csvContent], {type: 'text/csv'});
        element.href = URL.createObjectURL(file);
        element.download = 'tasks.csv';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        // Show success message with the full path
        const onedrivePath = getOneDrivePath();
        const message = document.createElement('div');
        message.style.position = 'fixed';
        message.style.top = '10px';
        message.style.left = '50%';
        message.style.transform = 'translateX(-50%)';
        message.style.backgroundColor = '#4CAF50';
        message.style.color = 'white';
        message.style.padding = '15px';
        message.style.borderRadius = '5px';
        message.style.zIndex = '1000';
        message.style.maxWidth = '80%';
        message.style.wordWrap = 'break-word';
        message.innerHTML = `Please save as:<br>${onedrivePath}\\tasks.csv`;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    } catch (error) {
        console.error('Error saving tasks:', error);
        alert('Error saving changes. Please try again.');
    }
}

// Function to load tasks
async function loadTasksFromCSV() {
    try {
        // Get OneDrive path
        const onedrivePath = getOneDrivePath();
        if (!onedrivePath) {
            throw new Error('OneDrive path not set');
        }
        
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        
        // Show file selection dialog
        input.click();
        
        // Handle file selection
        input.onchange = async function(e) {
            try {
                const file = e.target.files[0];
                if (!file) {
                    throw new Error('No file selected');
                }
                
                const csvText = await file.text();
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
                            remarks: task.remarks || ''
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
                
                // Show success message
                const message = document.createElement('div');
                message.style.position = 'fixed';
                message.style.top = '10px';
                message.style.left = '50%';
                message.style.transform = 'translateX(-50%)';
                message.style.backgroundColor = '#4CAF50';
                message.style.color = 'white';
                message.style.padding = '15px';
                message.style.borderRadius = '5px';
                message.style.zIndex = '1000';
                message.textContent = 'Tasks loaded successfully!';
                
                document.body.appendChild(message);
                setTimeout(() => message.remove(), 3000);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error loading tasks. Please try again.');
            }
        };
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
        saveTasksToCSV();
        displayTasks(staffName);
    }
}

// Function to update remarks
async function updateRemarks(staffName, taskId, remarks) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (task) {
        task.remarks = remarks;
        saveTasksToCSV();
    }
}

// Add a button to change OneDrive path
function addChangePathButton() {
    const button = document.createElement('button');
    button.textContent = 'Change OneDrive Path';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#f0f0f0';
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.onclick = function() {
        if (confirm('Do you want to change your OneDrive path?')) {
            localStorage.removeItem('onedrivePath');
            const newPath = getOneDrivePath();
            if (newPath) {
                alert('OneDrive path updated. New path:\n' + newPath);
            }
        }
    };
    document.body.appendChild(button);
}

// Call this when the page loads
window.addEventListener('load', addChangePathButton);

// Initialize token input when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load tasks when the page loads
    loadTasksFromCSV();
    
    document.getElementById('staffSelect').addEventListener('change', (e) => {
        displayTasks(e.target.value);
    });
});
