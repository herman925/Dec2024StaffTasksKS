// Staff data structure
let staffData = {};

// Function to load tasks from JSON
async function loadTasksFromJSON() {
    try {
        const response = await fetch('tasks.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        staffData = data.staff;
        
        if (hasNoTasks()) {
            showPointingArrow();
        } else {
            removePointingArrow();
        }
        
        displayTasks(document.getElementById('staffSelect').value);
        showLoadingMessage('Tasks loaded successfully!');
        
        // Close the load dialog if it exists
        const loadDialog = document.querySelector('.modal');
        if (loadDialog) {
            loadDialog.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showLoadingMessage('Error loading tasks. Please try again.', true);
        showPointingArrow();
    }
}

// Function to save tasks to JSON
async function saveTasksToJSON() {
    try {
        const response = await fetch('tasks.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ staff: staffData }, null, 2)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('Error saving tasks:', error);
        return false;
    }
}

// Function to display tasks for selected staff member
function displayTasks(staffName = '') {
    const tasksListElement = document.getElementById('tasksList');
    tasksListElement.innerHTML = '';

    // Show message when no staff is selected (check this first)
    if (!staffName || staffName === 'Select a staff member') {
        removePointingArrow();
        tasksListElement.innerHTML = `
            <div class="no-tasks-message select-staff-message">
                <i class="fas fa-user-friends"></i>
                <h2>Select a Staff Member</h2>
                <p>Choose a staff member from the dropdown above to view their tasks!</p>
                <i class="fas fa-candy-cane"></i>
            </div>
        `;
        return;
    }

    // Then check for no tasks
    if (hasNoTasks()) {
        showPointingArrow();
        tasksListElement.innerHTML = `
            <div class="no-tasks-message">
                <i class="fas fa-snowflake"></i>
                <h2>No Tasks Found</h2>
                <p>Click the "Load File from OneDrive" button to get started!</p>
                <i class="fas fa-snowflake"></i>
            </div>
        `;
        return;
    } else {
        removePointingArrow();
    }

    if (staffData[staffName]) {
        staffData[staffName].tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            // Choose a random Christmas icon for each task
            const christmasIcons = ['fa-gift', 'fa-star', 'fa-snowflake', 'fa-candy-cane', 'fa-tree'];
            const randomIcon = christmasIcons[Math.floor(Math.random() * christmasIcons.length)];
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'task-checkbox';
            checkbox.onclick = (e) => {
                e.stopPropagation();
                handleCheckboxChange(staffName, task.id, checkbox.checked);
            };

            taskElement.innerHTML = `
                <div class="task-header" onclick="showTaskModal('${staffName}', ${task.id})">
                    <i class="fas ${randomIcon} task-icon"></i>
                    <div class="task-title">
                        ${task.id}. ${task.text}
                    </div>
                </div>
            `;

            // Insert checkbox at the beginning
            taskElement.insertBefore(checkbox, taskElement.firstChild);
            tasksListElement.appendChild(taskElement);
        });
    }
}

// Function to toggle task completion
function toggleTask(staffName, taskId) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToJSON();
    }
}

// Function to update remarks
function updateRemarks(staffName, taskId, remarks) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (task) {
        task.remarks = remarks;
        saveTasksToJSON();
    }
}

// Function to toggle task details
function toggleTaskDetails(taskElement) {
    const details = taskElement.querySelector('.task-details');
    const expandIcon = taskElement.querySelector('.expand-icon');
    if (details && expandIcon) {
        details.classList.toggle('hidden');
        // Rotate the arrow when expanded
        expandIcon.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }
}

// Function to check if there are any tasks
function hasNoTasks() {
    if (!staffData) return true;
    return Object.values(staffData).every(staff => !staff.tasks || staff.tasks.length === 0);
}

// Function to show pointing arrow and message
function showPointingArrow() {
    removePointingArrow(); // Remove any existing arrows first
    
    // Create arrow container for better positioning
    const arrowContainer = document.createElement('div');
    arrowContainer.className = 'pointing-arrow';
    
    // Create arrow using Font Awesome icon
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-candy-cane';
    arrowContainer.appendChild(arrow);

    // Create message
    const message = document.createElement('div');
    message.className = 'initial-message';
    message.innerHTML = '<i class="fas fa-gift"></i> Click here to load your tasks! <i class="fas fa-gift"></i>';
    
    document.body.appendChild(arrowContainer);
    document.body.appendChild(message);
}

// Function to remove pointing arrow and message
function removePointingArrow() {
    const arrow = document.querySelector('.pointing-arrow');
    const message = document.querySelector('.initial-message');
    if (arrow) arrow.remove();
    if (message) message.remove();
}

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Check if tasks are loaded
    try {
        await loadTasksFromJSON();
    } catch (error) {
        // If tasks aren't loaded, show the pointing arrow
        showPointingArrow();
    }
    
    // Add event listener for staff selection changes
    document.getElementById('staffSelect').addEventListener('change', function(e) {
        displayTasks(e.target.value);
    });
    
    displayTasks(); // Add this line to show the initial message
});

// Function to show OneDrive path dialog
function showOneDrivePathDialog() {
    // Add modal styles if they don't exist
    if (!document.getElementById('oneDriveModalStyles')) {
        const style = document.createElement('style');
        style.id = 'oneDriveModalStyles';
        style.textContent = `
            .onedrive-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .onedrive-modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                max-width: 600px;
                width: 90%;
                border: 3px solid #1a472a;
            }
            .onedrive-modal button {
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                border: none;
                font-size: 1em;
                transition: all 0.2s ease;
            }
            .onedrive-modal button:last-child {
                background-color: #1a472a;
                color: white;
            }
            .onedrive-modal button:last-child:hover {
                background-color: #2d5a40;
                transform: translateY(-1px);
            }
            .onedrive-modal button:first-child {
                background-color: #f5f5f5;
                color: #333;
                margin-right: 10px;
            }
            .onedrive-modal button:first-child:hover {
                background-color: #e5e5e5;
            }
            .onedrive-modal input {
                width: 100%;
                padding: 12px;
                margin-bottom: 10px;
                border: 1px solid rgba(26, 71, 42, 0.2);
                border-radius: 8px;
                box-sizing: border-box;
                font-family: monospace;
                font-size: 0.95em;
                transition: all 0.2s ease;
            }
            .onedrive-modal input:focus {
                outline: none;
                border-color: #1a472a;
                box-shadow: 0 0 0 2px rgba(26, 71, 42, 0.1);
            }
            .onedrive-modal label {
                display: block;
                margin-bottom: 8px;
                color: #1a472a;
                font-weight: 600;
                font-size: 1.1em;
            }
            .onedrive-modal small {
                color: #666;
                display: block;
                margin-bottom: 15px;
                font-size: 0.9em;
            }
            .onedrive-modal h2 {
                margin-top: 0;
                margin-bottom: 25px;
                color: #1a472a;
                border-bottom: 1px solid rgba(26, 71, 42, 0.1);
                padding-bottom: 15px;
                font-size: 1.6em;
            }
            .onedrive-modal .path-preview {
                background: rgba(26, 71, 42, 0.05);
                padding: 20px;
                border-radius: 12px;
                margin: 15px 0;
                border: 1px solid rgba(26, 71, 42, 0.1);
            }
            .onedrive-modal .path-preview-label {
                display: block;
                color: #1a472a;
                margin-bottom: 12px;
                font-weight: 600;
                font-size: 1em;
            }
            .onedrive-modal .path-preview-content {
                white-space: pre-wrap;
                word-break: break-all;
                color: #333;
                font-family: monospace;
                font-size: 0.95em;
                line-height: 1.6;
            }
            .onedrive-modal .section {
                margin-bottom: 25px;
                padding-bottom: 25px;
                border-bottom: 1px solid rgba(26, 71, 42, 0.1);
            }
            .onedrive-modal .section:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .onedrive-modal .button-group {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 25px;
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
    dialog.className = 'onedrive-modal';
    dialog.innerHTML = `
        <div class="onedrive-modal-content">
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
                <label for="taskFileInput">Select Tasks JSON File:</label>
                <input type="file" id="taskFileInput" accept=".json">
                <small>Please select your tasks.json file</small>
            </div>
            <div class="button-group">
                <button onclick="this.closest('.onedrive-modal').remove()">Cancel</button>
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
            '\\tasks.json' : '';
        pathPreview.textContent = fullPath;
    }

    pathInput.addEventListener('input', updatePathPreview);
    updatePathPreview();
}

// Function to save OneDrive path and load tasks
async function saveOneDrivePath(button) {
    const dialog = button.closest('.onedrive-modal');
    const pathInput = dialog.querySelector('#pathInput');
    const fileInput = dialog.querySelector('#taskFileInput');
    
    try {
        // Get selected path
        let selectedPath = pathInput.value.trim();
        if (!selectedPath) {
            throw new Error('Please select or enter a OneDrive path');
        }

        // Construct full path
        const fullPath = selectedPath + 
            '\\The Education University of Hong Kong' +
            '\\o365grp_KeySteps@JC - General' +
            '\\00 - Project Admin' +
            '\\Summary of Team Task' +
            '\\Dec 2024 Pre-Christmas Tasks' +
            '\\tasks.json';

        // Save path to localStorage
        localStorage.setItem('onedrivePath', fullPath);

        // If a file was selected, read and use its content
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const content = JSON.parse(e.target.result);
                    staffData = content.staff || {};
                    await saveTasksToJSON();
                    showLoadingMessage('Tasks loaded successfully!');
                    displayTasks(document.getElementById('staffSelect').value);
                    dialog.remove();
                } catch (error) {
                    showLoadingMessage('Error parsing JSON file. Please check the file format.', true);
                }
            };
            
            reader.readAsText(file);
        } else {
            // No file selected, try to load from saved path
            try {
                await loadTasksFromJSON();
                dialog.remove();
            } catch (error) {
                showLoadingMessage('Error loading tasks. Please check the file path or select a file.', true);
            }
        }
    } catch (error) {
        showLoadingMessage(error.message, true);
    }
}

// Function to load tasks from JSON
async function loadTasksFromJSON() {
    const onedrivePath = getOneDrivePath();
    if (!onedrivePath) {
        showOneDrivePathDialog();
        return;
    }

    // If path exists, show dialog with file input
    // showOneDrivePathDialog();
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
                <button onclick="saveTasksToJSON(true); this.closest('.modal').remove()">Save</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

// Function to save tasks
async function saveTasksToJSON(confirmed = false) {
    if (!confirmed) {
        showSaveConfirmation();
        return;
    }

    const fullPath = getOneDrivePath();
    if (!fullPath) {
        alert('Please set up OneDrive path first');
        return;
    }

    try {
        // Create a Blob with UTF-8 encoding and BOM
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
        const jsonBlob = new Blob([bom, JSON.stringify({ staff: staffData }, null, 2)], { 
            type: 'application/json;charset=utf-8'
        });

        // Get the file handle using showSaveFilePicker
        const handle = await window.showSaveFilePicker({
            suggestedName: 'tasks.json',
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json'],
                },
            }],
            startIn: 'desktop',
        });

        // Create a FileSystemWritableFileStream to write to
        const writable = await handle.createWritable();

        // Write the content to the file
        await writable.write(jsonBlob);
        await writable.close();

        // Show success message
        showLoadingMessage('Tasks saved successfully!');

    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('File save was cancelled');
            return;
        }
        console.error('Error saving file:', err);
        showLoadingMessage('Error saving file: ' + err.message, true);
    }
}

// Function to add change path button
function addChangePathButton() {
    const container = document.querySelector('.container');
    const button = document.createElement('button');
    button.textContent = 'Load File from OneDrive';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background-color: #1a472a;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#c41e3a';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#1a472a';
    });
    button.onclick = showOneDrivePathDialog;
    document.body.appendChild(button);
}

// Create or update the persistent save notification
function showPersistentSaveNotification() {
    let notification = document.getElementById('saveNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'saveNotification';
        notification.className = 'persistent-notification';
        
        const message = document.createElement('span');
        message.textContent = 'You have unsaved changes';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'notification-buttons';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.onclick = async () => {
            await saveTasksToJSON(true);
            notification.remove();
        };
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Discard';
        cancelButton.onclick = () => {
            loadTasksFromJSON(); // Reload original data
            notification.remove();
        };
        
        buttonGroup.appendChild(saveButton);
        buttonGroup.appendChild(cancelButton);
        
        notification.appendChild(message);
        notification.appendChild(buttonGroup);
        document.body.appendChild(notification);
    }
}

// Update task handling
async function updateTask(staffName, taskId, updates) {
    if (!staffData[staffName]) return;
    
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Apply updates
    Object.assign(task, updates);
    
    // Show persistent save notification instead of immediate popup
    showPersistentSaveNotification();
    
    // Update display
    displayTasks(staffName);
}

// Handle checkbox changes
function handleCheckboxChange(staffName, taskId, checked) {
    updateTask(staffName, taskId, { completed: checked });
}

// Handle remarks changes
function handleRemarksChange(staffName, taskId, remarks) {
    updateTask(staffName, taskId, { remarks: remarks });
}

// Call this when the page loads
window.addEventListener('load', addChangePathButton);

// Function to show loading message
function showLoadingMessage(message, error = false) {
    const loadingMessage = document.createElement('div');
    loadingMessage.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 20px;
        background: ${error ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        text-align: center;
        max-width: 80%;
        word-wrap: break-word;
    `;
    loadingMessage.textContent = message;
    document.body.appendChild(loadingMessage);
    setTimeout(() => loadingMessage.remove(), 3000);
}

// Modal functions
let currentTaskData = null;

function showTaskModal(staffName, taskId) {
    const task = staffData[staffName].tasks.find(t => t.id === taskId);
    if (!task) return;

    currentTaskData = { staffName, taskId };
    
    const modal = document.getElementById('taskModal');
    const icon = modal.querySelector('.task-icon');
    const title = modal.querySelector('.modal-title');
    const description = modal.querySelector('.task-description');
    const remarks = modal.querySelector('.remarks-text');

    // Set random Christmas icon
    const christmasIcons = ['fa-gift', 'fa-star', 'fa-snowflake', 'fa-candy-cane', 'fa-tree'];
    const randomIcon = christmasIcons[Math.floor(Math.random() * christmasIcons.length)];
    icon.className = `fas ${randomIcon} task-icon`;

    title.textContent = `${task.id}. ${task.text}`;
    description.innerHTML = task.description.replace(/\n/g, '<br>');
    remarks.value = task.remarks || '';

    modal.classList.add('show');
    remarks.focus();
}

function saveTaskRemarks() {
    if (!currentTaskData) return;
    
    const remarks = document.querySelector('#taskModal .remarks-text').value;
    handleRemarksChange(currentTaskData.staffName, currentTaskData.taskId, remarks);
    
    // Show save confirmation
    const saveButton = document.querySelector('#taskModal .save-button');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveButton.classList.add('saved');
    
    setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.classList.remove('saved');
    }, 2000);
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
    currentTaskData = null;
}

// Close modal when clicking outside
document.getElementById('taskModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeTaskModal();
    }
});

// Add task modal to the page
const taskModal = document.createElement('div');
taskModal.id = 'taskModal';
taskModal.className = 'modal';
taskModal.innerHTML = `
    <div class="modal-content">
        <div class="task-header">
            <i class="fas fa-gift task-icon"></i>
            <div class="modal-title"></div>
        </div>
        <div class="task-description"></div>
        <div class="remarks">
            <label class="remarks-label">Remarks:</label>
            <textarea class="remarks-text"></textarea>
        </div>
        <button class="save-button" onclick="saveTaskRemarks()">Save Remarks</button>
        <button onclick="closeTaskModal()">Close</button>
    </div>
`;
document.body.appendChild(taskModal);
