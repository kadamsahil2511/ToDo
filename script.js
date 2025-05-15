// Main app logic for the Habit Tracker application
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const taskContainer = document.getElementById('task-container');
    const tabs = document.querySelectorAll('.tab');
    const addBtn = document.querySelector('.add-btn');
    const addTaskModal = document.getElementById('add-task-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const taskInput = document.getElementById('task-input');
    const taskCategory = document.getElementById('task-category');
    const taskPriority = document.getElementById('task-priority');
    const coinValue = document.getElementById('coin-value');
    const addTaskBtn = document.getElementById('add-task-btn');
    const profileBtn = document.querySelector('.profile-btn');
    const rewardsModal = document.getElementById('rewards-modal');
    const totalCoinsElement = document.getElementById('total-coins');
    const progressCountElement = document.getElementById('progress-count');
    
    // App state
    let tasks = JSON.parse(localStorage.getItem('tasks')) || getDefaultTasks();
    let rewards = JSON.parse(localStorage.getItem('rewards')) || getDefaultRewards();
    let currentTab = 'daily';
    let totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
    let completedCount = 0;
    let totalCount = 0;
    
    // Initialize app
    renderTasks();
    updateCoinDisplay();
    
    // Event listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            setActiveTab(tabName);
            currentTab = tabName;
            renderTasks();
        });
    });
    
    addBtn.addEventListener('click', function() {
        addTaskModal.classList.add('show');
    });
    
    profileBtn.addEventListener('click', function() {
        renderRewards();
        rewardsModal.classList.add('show');
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // Add reward form toggle
    document.getElementById('add-reward-toggle').addEventListener('click', function() {
        const form = document.getElementById('add-reward-form');
        form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    });
    
    // Add custom reward
    document.getElementById('add-reward-btn').addEventListener('click', function() {
        addCustomReward();
    });
    
    // Add task
    addTaskBtn.addEventListener('click', function() {
        addTask();
    });
    
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Functions
    function addTask() {
        const text = taskInput.value.trim();
        const category = taskCategory.value;
        const priority = taskPriority.value;
        let coins = parseInt(coinValue.value);
        
        if (text === '') {
            shakeElement(taskInput);
            return;
        }
        
        // Adjust coins based on priority
        if (priority === 'high') {
            coins = coins * 1.5; // 50% bonus for high priority
        } else if (priority === 'low') {
            coins = coins * 0.8; // 20% reduction for low priority
        }
        
        coins = Math.round(coins); // Round to nearest integer
        
        const newTask = {
            id: Date.now(),
            text: text,
            category: category,
            priority: priority,
            coins: coins,
            completed: false,
            type: currentTab,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        
        // Close modal and clear input
        addTaskModal.classList.remove('show');
        taskInput.value = '';
        
        // Render if in correct tab
        if (newTask.type === currentTab) {
            renderTasks();
        }
        
        updateProgress();
        
        // Show success message
        showToast('Task added successfully!');
    }
    
    function toggleTask(id) {
        let earnedCoins = 0;
        
        tasks = tasks.map(task => {
            if (task.id === id) {
                // If task is being marked as completed, add coins
                if (!task.completed) {
                    earnedCoins = task.coins;
                }
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        if (earnedCoins > 0) {
            addCoins(earnedCoins);
            showCoinAnimation(earnedCoins);
        }
        
        saveTasks();
        renderTasks();
        updateProgress();
    }
    
    function renderTasks() {
        taskContainer.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => task.type === currentTab);
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `<p>No ${currentTab} tasks yet!</p>
                                   <p>Use the + button to add tasks</p>`;
            taskContainer.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskContainer.appendChild(taskElement);
        });
    }
    
    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item task-${task.category} ${task.completed ? 'completed' : ''} priority-${task.priority || 'medium'}`;
        taskItem.setAttribute('data-id', task.id);
        
        // Create checkbox
        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('click', () => toggleTask(task.id));
        
        // Create task content
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const taskText = document.createElement('p');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        
        // Add priority badge if available
        if (task.priority) {
            const priorityBadge = document.createElement('span');
            priorityBadge.className = `priority-badge ${task.priority}`;
            priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            taskContent.appendChild(priorityBadge);
        }
        
        taskContent.appendChild(taskText);
        
        // Create coins display
        const coinsDisplay = document.createElement('div');
        coinsDisplay.className = 'task-coins';
        coinsDisplay.textContent = task.coins;
        
        // Append elements to taskItem
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskContent);
        taskItem.appendChild(coinsDisplay);
        
        return taskItem;
    }
    
    function setActiveTab(tabName) {
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    function updateProgress() {
        completedCount = tasks.filter(task => task.completed).length;
        totalCount = tasks.length;
        progressCountElement.textContent = `${completedCount} / ${totalCount}`;
    }
    
    function addCoins(amount) {
        totalCoins += amount;
        localStorage.setItem('totalCoins', totalCoins);
        updateCoinDisplay();
    }
    
    function updateCoinDisplay() {
        totalCoinsElement.textContent = totalCoins.toLocaleString();
    }
    
    function showCoinAnimation(amount) {
        // Create floating coin animation
        const coinAnimation = document.createElement('div');
        coinAnimation.className = 'floating-coin';
        coinAnimation.textContent = `+${amount}`;
        
        document.querySelector('.coin-display').appendChild(coinAnimation);
        
        setTimeout(() => {
            coinAnimation.remove();
        }, 1500);
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateProgress();
    }
    
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    function getDefaultTasks() {
        return [
            {
                id: 1,
                text: 'Tidy up bathroom and bedroom',
                category: 'bathroom',
                coins: 30,
                completed: false,
                type: 'daily'
            },
            {
                id: 2,
                text: 'Physical activity (sports, workout, etc.)',
                category: 'physical',
                coins: 40,
                completed: false,
                type: 'daily'
            },
            {
                id: 3,
                text: 'Proactively maintain hygiene and groom',
                category: 'hygiene',
                coins: 50,
                completed: false,
                type: 'daily'
            }
        ];
    }
    
    function getDefaultRewards() {
        return [
            {
                id: 1,
                name: '1 Hour Screen Time',
                description: 'Max: 5 hours / week',
                limit: 5,
                used: 2,
                cost: 0
            },
            {
                id: 2,
                name: 'Apple Watch',
                description: '2000 coins',
                cost: 2000,
                purchased: false
            }
        ];
    }
    
    // Add animations
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-5px); }
            }
            
            .shake {
                animation: shake 0.4s ease-in-out;
                border-color: #dc3545 !important;
            }
            
            .floating-coin {
                position: absolute;
                top: 50%;
                left: 50%;
                background-color: gold;
                color: #333;
                border-radius: 50px;
                font-weight: bold;
                padding: 5px 10px;
                animation: float-up 1.5s ease-out forwards;
                z-index: 10;
            }
            
            @keyframes float-up {
                0% { transform: translate(-50%, 0); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translate(-50%, -100px); opacity: 0; }
            }
        </style>
    `);
});