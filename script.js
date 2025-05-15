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
    const usernameElements = document.querySelectorAll('#username, .rewards-username');
    const notificationBadge = document.querySelector('.notification-badge');
    
    // App state
    let tasks = JSON.parse(localStorage.getItem('tasks')) || getDefaultTasks();
    let rewards = JSON.parse(localStorage.getItem('rewards')) || getDefaultRewards();
    let currentTab = 'daily';
    let totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
    let username = localStorage.getItem('username') || 'User';
    let completedCount = 0;
    let totalCount = 0;
    let notifications = [];
    let deletionTimers = {}; // Track deletion timers for completed tasks
    
    // Initialize app
    initApp();
    
    function initApp() {
        renderTasks();
        updateCoinDisplay();
        updateProgress();
        updateUsername();
        updateNotificationCount();
    }
    
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
        const task = tasks.find(t => t.id === id);
        
        // Only allow checking uncompleted tasks, not unchecking completed tasks
        if (task && !task.completed) {
            // Update the task to completed
            task.completed = true;
            task.completedAt = new Date().toISOString();
            earnedCoins = task.coins;
            
            // Store completion time for countdown display
            task.deleteAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now
            
            // Add notification
            addNotification(`Earned ${earnedCoins} coins for completing "${task.text}"`);
            
            // Add coins and show animation
            addCoins(earnedCoins);
            showCoinAnimation(earnedCoins);
            
            // Set a timer to delete the task after 5 minutes
            if (deletionTimers[task.id]) {
                clearTimeout(deletionTimers[task.id]);
            }
            deletionTimers[task.id] = setTimeout(() => {
                deleteCompletedTask(task.id);
            }, 5 * 60 * 1000); // 5 minutes
            
            saveTasks();
            renderTasks();
            updateProgress();
            
            showToast(`Task completed! Will be deleted in 5 minutes`);
        }
    }
    
    function deleteCompletedTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        
        if (deletionTimers[id]) {
            delete deletionTimers[id];
        }
        
        saveTasks();
        renderTasks();
        updateProgress();
        
        showToast("Completed task was automatically removed");
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
        
        // Sort tasks: incomplete tasks first, then completed tasks
        filteredTasks.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
        
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
        
        // Add timer indicator for completed tasks
        if (task.completed) {
            const timerIndicator = document.createElement('div');
            timerIndicator.className = 'timer-indicator';
            timerIndicator.innerHTML = '<i class="fas fa-clock"></i> Auto-deleting in 5m';
            taskContent.appendChild(timerIndicator);
        }
        
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
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCompletedTask(task.id);
        });
        
        // Append elements to taskItem
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskContent);
        taskItem.appendChild(coinsDisplay);
        taskItem.appendChild(deleteBtn);
        
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
    
    function updateUsername() {
        usernameElements.forEach(element => {
            element.textContent = username;
        });
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
    
    function saveRewards() {
        localStorage.setItem('rewards', JSON.stringify(rewards));
    }
    
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    // Reward functions
    function renderRewards() {
        const rewardsList = document.getElementById('rewards-list');
        rewardsList.innerHTML = '';
        
        rewards.forEach(reward => {
            const rewardElement = createRewardElement(reward);
            rewardsList.appendChild(rewardElement);
        });
    }
    
    function createRewardElement(reward) {
        const rewardItem = document.createElement('div');
        rewardItem.className = `reward-item ${reward.purchased ? 'purchased' : ''}`;
        rewardItem.setAttribute('data-id', reward.id);
        
        const rewardInfo = document.createElement('div');
        rewardInfo.className = 'reward-info';
        
        const rewardTitle = document.createElement('h3');
        rewardTitle.textContent = reward.name;
        
        const rewardDesc = document.createElement('p');
        rewardDesc.textContent = reward.description;
        
        rewardInfo.appendChild(rewardTitle);
        rewardInfo.appendChild(rewardDesc);
        
        rewardItem.appendChild(rewardInfo);
        
        // If reward has a usage limit
        if (reward.limit) {
            const rewardCount = document.createElement('div');
            rewardCount.className = 'reward-count';
            rewardCount.textContent = `${reward.used} of ${reward.limit} used`;
            rewardItem.appendChild(rewardCount);
        }
        
        // If reward is not purchased yet and has a cost
        if (!reward.purchased && reward.cost) {
            const applyBtn = document.createElement('button');
            applyBtn.className = 'apply-btn';
            applyBtn.textContent = reward.cost > 0 ? `Buy: ${reward.cost}` : 'Claim';
            applyBtn.disabled = reward.cost > totalCoins;
            
            if (reward.cost > totalCoins) {
                applyBtn.classList.add('disabled');
                applyBtn.title = `Need ${reward.cost - totalCoins} more coins`;
            }
            
            applyBtn.addEventListener('click', () => purchaseReward(reward.id));
            rewardItem.appendChild(applyBtn);
        } else if (reward.purchased) {
            const purchasedBadge = document.createElement('div');
            purchasedBadge.className = 'purchased-badge';
            purchasedBadge.textContent = 'Purchased';
            rewardItem.appendChild(purchasedBadge);
        }
        
        return rewardItem;
    }
    
    function purchaseReward(id) {
        const reward = rewards.find(r => r.id === id);
        
        if (!reward || (reward.cost > totalCoins)) {
            showToast('Not enough coins!');
            return;
        }
        
        // Deduct coins
        if (reward.cost > 0) {
            addCoins(-reward.cost);
        }
        
        // Update reward
        if (reward.limit) {
            reward.used = (reward.used || 0) + 1;
            if (reward.used >= reward.limit) {
                reward.purchased = true;
            }
        } else {
            reward.purchased = true;
        }
        
        saveRewards();
        renderRewards();
        
        addNotification(`${username} has claimed "${reward.name}"`);
        showToast(`Reward "${reward.name}" claimed!`);
    }
    
    function addCustomReward() {
        const nameInput = document.getElementById('reward-name');
        const descInput = document.getElementById('reward-description');
        const costInput = document.getElementById('reward-cost');
        
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const cost = parseInt(costInput.value) || 0;
        
        if (name === '') {
            shakeElement(nameInput);
            return;
        }
        
        const newReward = {
            id: Date.now(),
            name: name,
            description: description,
            cost: cost,
            purchased: false,
        };
        
        rewards.push(newReward);
        saveRewards();
        renderRewards();
        
        // Clear inputs
        nameInput.value = '';
        descInput.value = '';
        costInput.value = '';
        
        // Hide form
        document.getElementById('add-reward-form').style.display = 'none';
        
        showToast('Custom reward added!');
    }
    
    // Notification functions
    function addNotification(message) {
        const notification = {
            id: Date.now(),
            message: message,
            read: false,
            timestamp: new Date().toISOString()
        };
        
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        updateNotificationCount();
    }
    
    function updateNotificationCount() {
        const unreadCount = notifications.filter(n => !n.read).length;
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
    
    // Toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Remove toast after animation completes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    function getDefaultTasks() {
        return [
            {
                id: 1,
                text: 'Tidy up bathroom and bedroom',
                category: 'bathroom',
                coins: 30,
                completed: false,
                priority: 'medium',
                type: 'daily',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                text: 'Physical activity (sports, workout, etc.)',
                category: 'physical',
                coins: 40,
                completed: false,
                priority: 'medium',
                type: 'daily',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                text: 'Proactively maintain hygiene and groom',
                category: 'hygiene',
                coins: 50,
                completed: false,
                priority: 'medium',
                type: 'daily',
                createdAt: new Date().toISOString()
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
            
            .purchased-badge {
                background-color: #6bab7e;
                color: white;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
            }
            
            .apply-btn.disabled {
                background-color: #ccc;
                cursor: not-allowed;
            }
        </style>
    `);
    
    // Allow user to change username
    document.getElementById('username').addEventListener('click', function() {
        const newUsername = prompt('Enter your name:', username);
        if (newUsername && newUsername.trim() !== '') {
            username = newUsername.trim();
            localStorage.setItem('username', username);
            updateUsername();
        }
    });
});