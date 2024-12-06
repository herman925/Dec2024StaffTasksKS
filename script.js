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
    try {
        // Split into lines and remove any empty lines
        const lines = csvText.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse headers
        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['staff', 'position', 'taskId', 'taskText', 'taskDescription', 'completed', 'remarks'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        // Parse data rows
        return lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = [];
            let inQuotes = false;
            let currentValue = '';
            
            // Parse CSV considering quotes
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            values.push(currentValue.trim()); // Push the last value

            const entry = {};
            headers.forEach((header, i) => {
                let value = values[i] || '';
                // Remove quotes if present
                value = value.replace(/^"(.*)"$/, '$1').trim();
                
                // Convert values based on type
                if (header === 'completed') {
                    entry[header] = value.toLowerCase() === 'true';
                } else if (header === 'taskId') {
                    entry[header] = parseInt(value) || value;
                } else {
                    entry[header] = value;
                }
            });

            return entry;
        });
    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw error;
    }
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

// Function to show OneDrive path dialog
function showOneDrivePathDialog() {
    // Add modal styles if they don't exist
    if (!document.getElementById('modalStyles')) {
        const style = document.createElement('style');
        style.id = 'modalStyles';
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                width: 90%;
            }
            .modal button {
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #ccc;
            }
            .modal button:last-child {
                background-color: #4CAF50;
                color: white;
                border: none;
            }
            .modal input {
                width: 100%;
                padding: 8px;
                margin-bottom: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
                font-family: monospace;
            }
            .modal label {
                display: block;
                margin-bottom: 5px;
                color: #333;
                font-weight: 500;
            }
            .modal small {
                color: #666;
                display: block;
                margin-bottom: 15px;
            }
            .modal h2 {
                margin-top: 0;
                margin-bottom: 20px;
                color: #333;
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
            .modal .path-preview {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
                font-family: monospace;
                font-size: 13px;
                line-height: 1.4;
            }
            .modal .path-preview-label {
                display: block;
                color: #666;
                margin-bottom: 8px;
                font-weight: 500;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
            }
            .modal .path-preview-content {
                white-space: pre-wrap;
                word-break: break-all;
                color: #333;
            }
            .modal .section {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            .modal .section:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .modal .button-group {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // Get current OneDrive path
    const currentPath = localStorage.getItem('onedrivePath') || '';

    // Define common OneDrive paths
    const commonPaths = [
        {
            label: 'E: Drive',
            value: 'E:'
        },
        {
            label: 'D: Drive',
            value: 'D:'
        },
        {
            label: 'C: Drive with your username',
            value: 'C:\\Users\\KeySteps'
        }
    ];

    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.innerHTML = `
        <div class="modal-content">
            <h2>Select OneDrive Path and Tasks File</h2>
            <div class="section">
                <label for="pathInput">Choose or Type Drive:</label>
                <input type="text" 
                       id="pathInput" 
                       list="pathOptions" 
                       placeholder="Select or type drive (e.g. E:)"
                       value="${currentPath.split('\\')[0]}"
                       autocomplete="off">
                <datalist id="pathOptions">
                    ${commonPaths.map(path => `
                        <option value="${path.value}">${path.label}</option>
                    `).join('')}
                </datalist>
                <div class="path-preview">
                    <span class="path-preview-label">Full path will be:</span>
                    <div class="path-preview-content" id="fullPathPreview"></div>
                </div>
            </div>
            <div class="section">
                <label for="taskFileInput">Select Tasks CSV File:</label>
                <input type="file" id="taskFileInput" accept=".csv">
                <small>Please select your tasks.csv file</small>
            </div>
            <div class="button-group">
                <button onclick="this.closest('.modal').remove()">Cancel</button>
                <button onclick="saveOneDrivePath(this)">OK</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Add path preview update handler
    const pathInput = dialog.querySelector('#pathInput');
    const pathPreview = dialog.querySelector('#fullPathPreview');
    
    function updatePathPreview() {
        const basePath = pathInput.value;
        const fullPath = basePath ? 
            basePath + 
            '\\The Education University of Hong Kong' +
            '\\o365grp_KeySteps@JC - General' +
            '\\00 - Project Admin' +
            '\\Summary of Team Task' +
            '\\Dec 2024 Pre-Christmas Tasks' +
            '\\tasks.csv' : '';
        pathPreview.textContent = fullPath;
    }

    pathInput.addEventListener('input', updatePathPreview);
    updatePathPreview();
}

// Function to save OneDrive path and load tasks
async function saveOneDrivePath(button) {
    const dialog = button.closest('.modal');
    const pathInput = dialog.querySelector('#pathInput');
    const fileInput = dialog.querySelector('#taskFileInput');
    
    try {
        // Get selected path
        let selectedPath = pathInput.value.trim();
        if (!selectedPath) {
            throw new Error('Please select or enter a OneDrive path');
        }

        // Check if a file was selected
        if (!fileInput.files || fileInput.files.length === 0) {
            throw new Error('Please select a tasks.csv file');
        }

        // Save path to localStorage
        localStorage.setItem('onedrivePath', selectedPath);
        
        // Remove dialog
        dialog.remove();

        // Show loading message
        const loadingMessage = document.createElement('div');
        loadingMessage.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #2196F3;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            text-align: center;
            max-width: 80%;
            word-wrap: break-word;
        `;
        loadingMessage.textContent = 'Reading tasks file...';
        document.body.appendChild(loadingMessage);

        try {
            // Read and parse the CSV file
            const file = fileInput.files[0];
            const csvText = await file.text();
            const tasks = parseCSV(csvText);

            if (tasks.length === 0) {
                throw new Error('No tasks found in CSV file');
            }

            // Reset existing tasks
            Object.values(staffData).forEach(staff => staff.tasks = []);

            // Populate tasks
            let taskCount = 0;
            tasks.forEach(task => {
                if (staffData[task.staff]) {
                    staffData[task.staff].tasks.push({
                        id: task.taskId,
                        text: task.taskText,
                        description: task.taskDescription || '',
                        completed: task.completed,
                        remarks: task.remarks || ''
                    });
                    taskCount++;
                } else {
                    console.warn(`Warning: Staff member "${task.staff}" not found in staffData`);
                }
            });

            // Save to localStorage
            localStorage.setItem('staffTasks', JSON.stringify(staffData));

            // Update display
            const staffSelect = document.getElementById('staffSelect');
            if (staffSelect.value) {
                displayTasks(staffSelect.value);
            }

            // Show success message
            loadingMessage.style.backgroundColor = '#4CAF50';
            loadingMessage.innerHTML = `Successfully loaded ${taskCount} tasks from ${file.name}`;
            setTimeout(() => loadingMessage.remove(), 3000);

        } catch (error) {
            console.error('Error processing tasks:', error);
            loadingMessage.style.backgroundColor = '#f44336';
            loadingMessage.innerHTML = `Error: ${error.message}`;
            setTimeout(() => loadingMessage.remove(), 5000);
        }

    } catch (error) {
        alert(error.message);
    }
}

// Function to load tasks from CSV
async function loadTasksFromCSV() {
    const onedrivePath = getOneDrivePath();
    if (!onedrivePath) {
        showOneDrivePathDialog();
        return;
    }

    // If path exists, show dialog with file input
    showOneDrivePathDialog();
}

// Function to get OneDrive path
function getOneDrivePath() {
    let path = localStorage.getItem('onedrivePath');
    if (!path) {
        return null;
    }
    return path + '\\The Education University of Hong Kong\\o365grp_KeySteps@JC - General\\00 - Project Admin\\Summary of Team Task\\Dec 2024 Pre-Christmas Tasks';
}

// Function to show save confirmation dialog
function showSaveConfirmation() {
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <h2>Save Changes?</h2>
            <p>Do you want to save your changes to the tasks file?</p>
            <div class="button-group">
                <button onclick="this.closest('.modal').remove()">Cancel</button>
                <button onclick="saveTasksToCSV(true); this.closest('.modal').remove()">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

// Function to save tasks
async function saveTasksToCSV(confirmed = false) {
    if (!confirmed) {
        showSaveConfirmation();
        return;
    }

    const csvContent = generateCSVContent();
    const fullPath = getOneDrivePath();
    if (!fullPath) {
        alert('Please set up OneDrive path first');
        return;
    }

    try {
        // Show guidance message before file picker
        const guidanceMsg = document.createElement('div');
        guidanceMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1001;
            text-align: center;
            max-width: 500px;
        `;
        guidanceMsg.innerHTML = `
            <h3 style="margin-top: 0;">Save File Instructions</h3>
            <p>It wll proceed to save to this location:</p>
            <code style="background: #f5f5f5; padding: 5px; display: block; margin: 10px 0; word-break: break-all;">${fullPath}</code>
            <button onclick="this.parentElement.remove(); initiateActualSave();" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Continue to Save</button>
        `;
        document.body.appendChild(guidanceMsg);

        // Define the actual save function
        window.initiateActualSave = async () => {
            try {
                // Create file picker with simple options
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'tasks.csv',
                    types: [{
                        description: 'CSV Files',
                        accept: {
                            'text/csv': ['.csv'],
                        },
                    }],
                });

                // Write the content
                const writable = await handle.createWritable();
                await writable.write(csvContent);
                await writable.close();

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: #4CAF50;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s;
                `;
                successMsg.textContent = 'Tasks saved successfully!';
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.style.opacity = '1', 0);
                setTimeout(() => {
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.remove(), 300);
                }, 3000);

            } catch (err) {
                if (err.name !== 'AbortError') {  // Don't show error if user just cancelled
                    console.error('Error saving file:', err);
                    alert('Error saving file: ' + err.message);
                }
            }
        };

    } catch (error) {
        console.error('Error in save process:', error);
        alert('Error in save process: ' + error.message);
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
function toggleTask(staffName, taskId) {
    const staff = staffData[staffName];
    if (staff) {
        const task = staff.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('staffTasks', JSON.stringify(staffData));
            displayTasks(staffName);
            saveTasksToCSV(); // Show save confirmation
        }
    }
}

// Function to update remarks
function updateRemarks(staffName, taskId, remarks) {
    const staff = staffData[staffName];
    if (staff) {
        const task = staff.tasks.find(t => t.id === taskId);
        if (task) {
            task.remarks = remarks;
            localStorage.setItem('staffTasks', JSON.stringify(staffData));
            saveTasksToCSV(); // Show save confirmation
        }
    }
}

// Add a button to change OneDrive path
function addChangePathButton() {
    const button = document.createElement('button');
    button.textContent = 'Change OneDrive Path';
    button.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        padding: 10px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: pointer;
    `;
    button.onclick = function() {
        localStorage.removeItem('onedrivePath');
        const modal = showOneDrivePathDialog();
        document.body.appendChild(modal);
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
