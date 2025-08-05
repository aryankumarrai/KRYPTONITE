// --- THEME SWITCHER LOGIC ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function applySavedTheme() {
    const savedTheme = localStorage.getItem('kryptonite-theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.checked = true;
    }
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.add('light-mode');
        localStorage.setItem('kryptonite-theme', 'light');
    } else {
        body.classList.remove('light-mode');
        localStorage.setItem('kryptonite-theme', 'dark');
    }
});

// --- CHATBOT LOGIC ---
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggleBtn = document.getElementById('history-toggle-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');

let conversations = {};
let currentConversationId = null;
let lastInputWasVoice = false;

// --- HISTORY & CONVERSATION MANAGEMENT ---
function saveConversations() {
    localStorage.setItem('kryptonite-conversations', JSON.stringify(conversations));
}

function loadConversations() {
    const savedConversations = localStorage.getItem('kryptonite-conversations');
    conversations = savedConversations ? JSON.parse(savedConversations) : {};
    currentConversationId = localStorage.getItem('kryptonite-current-conversation');
    
    if (!currentConversationId || !conversations[currentConversationId]) {
        startNewChat();
    } else {
        loadChat(currentConversationId);
    }
    renderHistoryList();
}

function startNewChat() {
    speechSynthesis.cancel();
    const newId = `chat_${Date.now()}`;
    currentConversationId = newId;
    conversations[newId] = {
        id: newId,
        title: "New Chat",
        history: []
    };
    localStorage.setItem('kryptonite-current-conversation', newId);
    loadChat(newId);
    renderHistoryList();
}

function loadChat(id) {
    if (!conversations[id]) return;
    currentConversationId = id;
    localStorage.setItem('kryptonite-current-conversation', id);
    const conversation = conversations[id];
    
    chatContainer.innerHTML = '';
    if (conversation.history.length === 0) {
        addInitialMessage();
    } else {
        conversation.history.forEach(message => {
            addMessage(message.role, message.parts[0].text, false);
        });
    }
    renderHistoryList();
    historyPanel.classList.remove('open');
}

function renderHistoryList() {
    historyList.innerHTML = '';
    Object.values(conversations).reverse().forEach(convo => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = convo.title;
        if (convo.id === currentConversationId) {
            item.classList.add('active');
        }
        item.addEventListener('click', () => loadChat(convo.id));
        historyList.appendChild(item);
    });
}

function clearAllHistory() {
    if (confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
        conversations = {};
        currentConversationId = null;
        localStorage.removeItem('kryptonite-conversations');
        localStorage.removeItem('kryptonite-current-conversation');
        startNewChat();
    }
}

newChatBtn.addEventListener('click', startNewChat);
historyToggleBtn.addEventListener('click', () => historyPanel.classList.add('open'));
closeHistoryBtn.addEventListener('click', () => historyPanel.classList.remove('open'));
clearAllHistoryBtn.addEventListener('click', clearAllHistory);

// --- UI & MESSAGE FUNCTIONS ---
function addInitialMessage() {
    addMessage('bot', "Yo! What's the vibe? Kryptonite here, the bot built by the legend Aryan. Spill the tea, what we getting into?");
}

function speak(text) {
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Here is a code snippet.');
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    speechSynthesis.speak(utterance);
}

function addMessage(sender, message, shouldSpeak = false) {
    const messageWrapper = document.createElement('div');
    const roleClass = sender === 'model' ? 'bot' : sender;
    messageWrapper.className = `message-group ${roleClass}`;
    
    let avatarContent;
    if (roleClass === 'user') {
        avatarContent = `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`;
    } else {
        avatarContent = `<svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 3.5L6 12L13.5 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7L20 5" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 17L20 19" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    
    let formattedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    formattedMessage = formattedMessage.replace(codeBlockRegex, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    });

    const messageContentHTML = `
        <div class="avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble">${formattedMessage}</div>
        </div>
    `;
    
    messageWrapper.innerHTML = messageContentHTML;
    chatContainer.appendChild(messageWrapper);

    messageWrapper.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    chatContainer.scrollTop = chatContainer.scrollHeight; 

    if (roleClass === 'bot' && shouldSpeak && lastInputWasVoice) {
        speak(message);
    }
}

function showTypingIndicator() {
    const typingIndicatorHTML = `<div class="message-group bot" id="typing-indicator"><div class="avatar"><svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 3.5L6 12L13.5 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7L20 5" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 17L20 19" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="message-content"><div class="message-bubble"><div class="flex items-center justify-center space-x-1"><div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div></div></div></div></div>`;
    chatContainer.innerHTML += typingIndicatorHTML;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// --- API & CHAT HANDLING ---
async function generateResponse(prompt) {
    const apiUrl = 'https://kryptonite-backend.onrender.com';

    const currentConvo = conversations[currentConversationId];
    currentConvo.history.push({ role: "user", parts: [{ text: prompt }] });
    
    if (currentConvo.history.length === 1) {
        currentConvo.title = prompt.substring(0, 30);
    }
    saveConversations();
    renderHistoryList();

    const systemInstruction = { parts: [{ text: "You are Kryptonite, a fun, funky, and cool chatbot with a Gen Z personality. You were created by Aryan. Your language is full of modern slang. IMPORTANT: When you provide code, you MUST always format it in a Markdown code block, like ```language\n...code...\n```. Ensure the code is syntactically correct and complete." }] };
    
    const payload = { 
        contents: currentConvo.history, 
        system_instruction: systemInstruction 
    };

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        // ** THE FIX IS HERE **
        // First, check if the response was successful.
        if (!response.ok) {
            // If not, try to get the error message from the body, or just use the status text.
            const errorText = await response.text(); // Get the raw error text (which might be HTML)
            console.error("Backend Error Response:", errorText);
            throw new Error(`The server responded with status: ${response.status} ${response.statusText}`);
        }
        
        // Only if the response was ok, try to parse it as JSON.
        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts[0]) {
            const botResponse = result.candidates[0].content.parts[0].text;
            currentConvo.history.push({ role: "model", parts: [{ text: botResponse }] });
            saveConversations();
            return botResponse;
        } else {
            if (result.promptFeedback?.blockReason) return `Yikes, can't vibe with that. My programming says that's a no-go zone. Try something else!`;
            return "Oof, my brain just glitched. No cap. Try that again?";
        }
    } catch (error) {
        console.error("Error calling backend:", error);
        return `Oof, major L. The mainframe connection failed. The console says: "${error.message}". No cap.`;
    }
}

async function handleChat(isVoiceInput = false) {
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    lastInputWasVoice = isVoiceInput;
    addMessage('user', userMessage, false);
    userInput.value = '';

    showTypingIndicator();
    const botMessage = await generateResponse(userMessage);
    removeTypingIndicator();
    addMessage('bot', botMessage, true);
}

sendBtn.addEventListener('click', () => handleChat(false));
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleChat(false);
});

// --- SPEECH RECOGNITION ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
        if (!micBtn.classList.contains('is-recording')) recognition.start();
        else recognition.stop();
    });

    recognition.onstart = () => {
        micBtn.classList.add('is-recording');
        userInput.placeholder = "Listening...";
    };

    recognition.onend = () => {
        micBtn.classList.remove('is-recording');
        userInput.placeholder = "Spill the tea... or press the mic";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        userInput.value = transcript;
        setTimeout(() => handleChat(true), 200);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        userInput.placeholder = "Mic not working, fam.";
    };
} else {
    micBtn.style.display = 'none';
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    loadConversations();
});
