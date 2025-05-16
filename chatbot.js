const apiKey = 'AIzaSyDwzBCUD13TG9E4UWK06y88ujbxHeVmbDQ'

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const chatbotInput = document.getElementById('chatbot-input');
  const sendMessageBtn = document.getElementById('send-message-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotBtn = document.querySelector('.chatbot-btn');
  const chatbotModal = document.getElementById('chatbot-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  // Chat history to maintain context
  let chatHistory = [];

  // Event listeners
  sendMessageBtn.addEventListener('click', sendMessage);
  
  // Send message when Enter key is pressed
  chatbotInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Close modal event
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      modal.classList.remove('show');
    });
  });

  // Function to send message
  async function sendMessage() {
    const message = chatbotInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to UI
    addMessageToUI(message, 'user');
    
    // Clear input
    chatbotInput.value = '';
    
    // Show thinking indicator
    showThinkingIndicator();
    
    try {
      // Get response from Gemini API
      const response = await callGeminiAPI(message);
      
      // Remove thinking indicator
      removeThinkingIndicator();
      
      // Add bot message to UI
      addMessageToUI(response, 'bot');
    } catch (error) {
      console.error('Error:', error);
      
      // Remove thinking indicator
      removeThinkingIndicator();
      
      // Show error message
      addMessageToUI('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  // Function to call Gemini API
  async function callGeminiAPI(message) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Function to add message to UI
  function addMessageToUI(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message bot-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${formatMessage(message)}</p>`;
    
    messageElement.appendChild(messageContent);
    chatbotMessages.appendChild(messageElement);
    
    // Scroll to the bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Function to format message with line breaks
  function formatMessage(text) {
    // Replace **text** with <b>text</b> and \n with <br>
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/^\s*\*\s+(.*)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
      
  }

  // Function to show thinking indicator
  function showThinkingIndicator() {
    const thinkingElement = document.createElement('div');
    thinkingElement.className = 'message bot-message thinking';
    thinkingElement.id = 'thinking-indicator';
    
    const thinkingContent = document.createElement('div');
    thinkingContent.className = 'message-thinking';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'thinking-dot';
      thinkingContent.appendChild(dot);
    }
    
    thinkingElement.appendChild(thinkingContent);
    chatbotMessages.appendChild(thinkingElement);
    
    // Scroll to the bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Function to remove thinking indicator
  function removeThinkingIndicator() {
    const thinkingIndicator = document.getElementById('thinking-indicator');
    if (thinkingIndicator) {
      thinkingIndicator.remove();
    }
  }
});
