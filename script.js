// Staff data structure
let staffData = {};

// Function to load tasks from JSON
async function loadTasksFromJSON() {
    const onedrivePath = getOneDrivePath();
    if (!onedrivePath) {
        showOneDrivePathDialog();
        return Promise.resolve(); // Silently resolve
    }

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

// Function to toggle task details
function toggleTaskDetails(taskElement) {
    const details = taskElement.querySelector('.task-details');
    const expandIcon = taskElement.querySelector('.expand-icon');
    if (details && expandIcon) {
        details.classList.toggle('hidden');
        expandIcon.style.transform = details.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
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
            .email-input-container {
                display: none;
                margin-top: 15px;
            }
            .email-input-container.visible {
                display: block;
            }
            .email-input-container input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                margin-top: 5px;
            }
            .browse-button {
                padding: 8px 16px;
                background-color: #f5f5f5;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
                width: 100%;
            }
            .browse-button:hover {
                background-color: #e5e5e5;
            }
            .path-input-container {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .hidden {
                display: none !important;
            }
            .path-preview-container {
                display: none;
                margin-top: 15px;
            }
            .path-preview-container.visible {
                display: block;
            }
            .path-preview-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 5px 0;
            }
            .copy-icon {
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .copy-icon:hover {
                background-color: #e5e5e5;
            }
            .copy-icon svg {
                width: 16px;
                height: 16px;
                fill: #666;
            }
            .copy-icon.copied svg {
                fill: #4CAF50;
            }
            .copy-icon::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 100%;
                right: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.2s;
            }
            .copy-icon:hover::after {
                visibility: visible;
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    const modal = document.createElement('div');
    modal.className = 'onedrive-modal';
    modal.innerHTML = `
        <div class="onedrive-modal-content">
            <h2 style="margin-top: 0;">Select OneDrive Path</h2>
            <p>Please select your OneDrive path:</p>
            
            <div style="margin: 20px 0;">
                <div class="path-input-container">
                    <select id="pathInput" style="width: 100%; padding: 8px;">
                        <option value="">Select a path...</option>
                        <option value="C:">C: Drive</option>
                        <option value="D:">D: Drive</option>
                        <option value="E:">E: Drive</option>
                    </select>
                    <input type="file" id="folderInput" accept=".json" style="display: none;">
                </div>
                
                <div id="emailInputContainer" class="email-input-container">
                    <label for="staffEmail">Enter your local username (usually it is xxx@eduhk.hk without @eduhk.hk):</label>
                    <input type="text" id="staffEmail" placeholder="e.g., hkkchan" />
                </div>

                <div id="pathPreviewContainer" class="path-preview-container">
                    <div class="path-preview-header">
                        <p style="margin: 0;">Path preview:</p>
                        <div class="copy-icon" onclick="copyPathToClipboard(this)" data-tooltip="Copy path">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </div>
                    </div>
                    <div id="pathPreview" style="word-break: break-all; padding: 10px; background: #f5f5f5; border-radius: 4px;"></div>
                    <button class="browse-button hidden" onclick="document.getElementById('folderInput').click()">Browse...</button>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button onclick="this.closest('.onedrive-modal').remove()">Cancel</button>
                <button id="loadFileBtn" class="hidden" onclick="saveOneDrivePath(this)">Load File</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const pathInput = modal.querySelector('#pathInput');
    const emailInputContainer = modal.querySelector('#emailInputContainer');
    const staffEmailInput = modal.querySelector('#staffEmail');
    const pathPreviewContainer = modal.querySelector('#pathPreviewContainer');
    const pathPreview = modal.querySelector('#pathPreview');
    const browseButton = modal.querySelector('.browse-button');
    const loadFileBtn = modal.querySelector('#loadFileBtn');

    function updateUIState() {
        const selectedPath = pathInput.value;
        const staffEmail = staffEmailInput.value.trim();

        // Reset UI elements
        emailInputContainer.classList.remove('visible');
        pathPreviewContainer.classList.remove('visible');
        browseButton.classList.add('hidden');
        loadFileBtn.classList.add('hidden');

        if (!selectedPath) {
            return;
        }

        if (selectedPath === 'C:') {
            // Show email input for C: drive
            emailInputContainer.classList.add('visible');
            
            // Only show path preview and browse button if email is provided
            if (staffEmail) {
                pathPreviewContainer.classList.add('visible');
                browseButton.classList.remove('hidden');
                loadFileBtn.classList.remove('hidden');
            }
        } else if (selectedPath === 'D:' || selectedPath === 'E:') {
            // Show path preview and browse button immediately for D: and E: drives
            pathPreviewContainer.classList.add('visible');
            browseButton.classList.remove('hidden');
            loadFileBtn.classList.remove('hidden');
        }
    }

    function updatePathPreview() {
        const basePath = pathInput.value;
        let fullPath = '';

        if (basePath === 'C:') {
            const staffEmail = staffEmailInput.value.trim();
            if (staffEmail) {
                fullPath = `C:\\Users\\${staffEmail}` +
                    '\\The Education University of Hong Kong' +
                    '\\o365grp_KeySteps@JC - General' +
                    '\\00 - Project Admin' +
                    '\\Summary of Team Task' +
                    '\\Dec 2024 Pre-Christmas Tasks' +
                    '\\tasks.json';
            } else {
                fullPath = 'Please enter your staff email';
            }
        } else {
            fullPath = basePath ? 
                basePath + 
                '\\The Education University of Hong Kong' +
                '\\o365grp_KeySteps@JC - General' +
                '\\00 - Project Admin' +
                '\\Summary of Team Task' +
                '\\Dec 2024 Pre-Christmas Tasks' +
                '\\tasks.json' : '';
        }
        pathPreview.textContent = fullPath;
        updateUIState();
    }

    pathInput.addEventListener('input', updatePathPreview);
    staffEmailInput.addEventListener('input', updatePathPreview);
    updatePathPreview();

    // Add folder input change handler
    const folderInput = modal.querySelector('#folderInput');
    folderInput.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            // Get the path from the selected file
            const filePath = this.files[0].path;
            if (!filePath) {
                return;
            }

            // Extract the drive letter and path
            const driveLetter = filePath.split(':')[0] + ':';
            const select = this.closest('.onedrive-modal-content').querySelector('#pathInput');
            
            // Update the select with the drive letter
            let driveOption = null;
            for (let opt of select.options) {
                if (opt.value === driveLetter) {
                    driveOption = opt;
                    break;
                }
            }
            
            if (!driveOption) {
                const option = document.createElement('option');
                option.value = driveLetter;
                option.textContent = `${driveLetter} Drive`;
                select.appendChild(option);
                driveOption = option;
            }
            
            select.value = driveLetter;
            
            // Trigger the path preview update
            select.dispatchEvent(new Event('input'));
        }
    });
}

// Function to copy path to clipboard
function copyPathToClipboard(icon) {
    const pathText = document.getElementById('pathPreview').textContent;
    navigator.clipboard.writeText(pathText).then(() => {
        icon.classList.add('copied');
        icon.setAttribute('data-tooltip', 'Copied!');
        setTimeout(() => {
            icon.classList.remove('copied');
            icon.setAttribute('data-tooltip', 'Copy path');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy path:', err);
        icon.setAttribute('data-tooltip', 'Failed to copy');
        setTimeout(() => {
            icon.setAttribute('data-tooltip', 'Copy path');
        }, 2000);
    });
}

// Function to save OneDrive path and load tasks
async function saveOneDrivePath(button) {
    const dialog = button.closest('.onedrive-modal');
    const pathInput = dialog.querySelector('#pathInput');
    const staffEmailInput = dialog.querySelector('#staffEmail');
    const folderInput = dialog.querySelector('#folderInput');
    
    try {
        // Get selected path
        let selectedPath = pathInput.value.trim();
        if (!selectedPath) {
            throw new Error('Please select or enter a OneDrive path');
        }

        // Check if C: drive is selected and validate email
        if (selectedPath === 'C:') {
            const staffEmail = staffEmailInput.value.trim();
            if (!staffEmail) {
                throw new Error('Please enter your staff email');
            }
            selectedPath = `C:\\Users\\${staffEmail}`;
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

        // If a file was selected through browse, read and use its content
        if (folderInput.files.length > 0) {
            const file = folderInput.files[0];
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

// Function to load default tasks from the cloud
async function loadDefaultTasks() {
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
        showLoadingMessage('Default tasks loaded successfully!');
    } catch (error) {
        console.error('Error loading default tasks:', error);
        showLoadingMessage('Error loading default tasks. Please try again.', true);
        showPointingArrow();
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
    // Function disabled - buttons now handled in HTML
    return;
}

// Call this when the page loads
// window.addEventListener('load', addChangePathButton);  

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
    description.textContent = task.description || 'No description available.';
    remarks.value = task.remarks || '';

    modal.style.display = 'block';
    modal.classList.remove('hidden');
    remarks.focus();
}

function saveTaskRemarks() {
    if (!currentTaskData) return;
    
    const { staffName, taskId } = currentTaskData;
    const remarks = document.querySelector('.remarks-text').value;
    
    updateTask(staffName, taskId, { remarks });
    closeTaskModal();
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    currentTaskData = null;
}

// Close modal when clicking outside
window.addEventListener('load', function() {
    const modal = document.getElementById('taskModal');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeTaskModal();
        }
    });
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
