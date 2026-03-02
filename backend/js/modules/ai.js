/**
 * AI Chatbot Module
 * Handles the floating AI chat button and chat interface
 */

export function init() {
    // Only attach once
    if (document.getElementById('aiChatButton')) return;

    // Create the floating button
    const btn = document.createElement('button');
    btn.id = 'aiChatButton';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open AI Chat');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');

    const isItemized = window.location.pathname.includes('itemized');
    const bottomClass = isItemized ? 'bottom-[100px]' : 'bottom-4';
    const rightClass = isItemized ? 'right-6' : 'right-4';

    btn.className = `fixed ${bottomClass} ${rightClass} z-[1001] inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none disabled:opacity-50 rounded-full w-14 h-14 bg-[#224796] hover:bg-[#163473] text-white shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#224796]/30 cursor-pointer p-0`;

    btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
    `;

    // Create the chat container
    const container = document.createElement('div');
    container.id = 'aiChatContainer';
    container.className = 'fixed bottom-[calc(4.5rem+1.5rem)] right-4 z-[1001] bg-white rounded-2xl border border-[#e5e7eb] shadow-2xl w-[90vw] sm:w-[400px] md:w-[440px] h-[70vh] sm:h-[600px] md:h-[634px] flex flex-col hidden transition-all duration-300 origin-bottom-right transform scale-95 opacity-0';

    // Desktop vs Mobile specific classes via JS or Media Queries? 
    // I'll use Tailwind responsive classes.
    // For mobile (under sm): fixed inset-0 w-full h-full rounded-none
    container.className = 'fixed bottom-20 right-4 z-[1001] bg-white rounded-2xl border border-[#e5e7eb] shadow-2xl w-[calc(100vw-2rem)] sm:w-[400px] md:w-[440px] h-[70vh] sm:h-[600px] md:h-[634px] flex flex-col hidden transition-all duration-300 origin-bottom-right transform scale-95 opacity-0 max-sm:bottom-2 max-sm:right-2 max-sm:left-2 max-sm:m-auto max-sm:w-[calc(100vw-1rem)] max-sm:h-[80vh] max-sm:rounded-2xl max-sm:border';

    container.innerHTML = `
        <!-- Heading -->
        <div class="flex items-center justify-between p-4 border-b bg-[#224796] text-white rounded-t-2xl">
            <div class="flex items-center gap-3">
                <button id="closeAiChatMobile" class="sm:hidden p-1 hover:bg-white/20 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <div>
                    <h2 class="font-bold text-lg tracking-tight">AI Personal Assistant</h2>
                    <p class="text-xs text-blue-100 leading-tight">Always here to help</p>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button id="clearAiChat" class="p-1.5 hover:bg-white/20 rounded-lg transition" title="Clear Chat History">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <button id="closeAiChat" class="hidden sm:block p-1.5 hover:bg-white/20 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Chat Container -->
        <div id="aiChatMessages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            <!-- Chat Message AI -->
            <div class="flex gap-3 text-sm">
                <div class="shrink-0">
                    <div class="rounded-full bg-[#224796] text-white p-2 flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col gap-1 max-w-[80%]">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</span>
                    <div class="bg-white border text-slate-700 p-2 px-3 rounded-2xl rounded-tl-none shadow-sm leading-tight">Hi, how can I help you today?</div>
                </div>
            </div>
        </div>

        <!-- Input box  -->
        <div class="p-4 border-t bg-white max-sm:pb-8">
            <form id="aiChatForm" class="flex items-center gap-2">
                <div class="relative flex-1">
                    <input
                        type="text"
                        id="aiChatInput"
                        class="flex h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#224796]/50 focus:border-[#224796] transition-all"
                        placeholder="Ask me anything..."
                    >
                </div>
                <button
                    type="submit"
                    class="inline-flex items-center justify-center rounded-full bg-[#224796] hover:bg-[#163473] text-white h-11 w-11 transition-all shadow-md active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(container);

    // Toggle Chat
    const toggleChat = () => {
        const isOpen = !container.classList.contains('hidden');
        const itemizedBtn = document.getElementById('itemizedVoucherFloatingBtn');
        if (isOpen) {
            // Close
            container.classList.add('scale-95', 'opacity-0');
            btn.setAttribute('aria-expanded', 'false');
            setTimeout(() => {
                container.classList.add('hidden');
                if (itemizedBtn) itemizedBtn.style.display = 'flex';
            }, 300);
        } else {
            // Open
            container.classList.remove('hidden');
            if (itemizedBtn) itemizedBtn.style.display = 'none';
            // Small delay for animation
            setTimeout(() => {
                container.classList.remove('scale-95', 'opacity-0');
                btn.setAttribute('aria-expanded', 'true');
            }, 10);
            messages.scrollTop = messages.scrollHeight; // Scroll to bottom on open
        }
    };

    btn.addEventListener('click', toggleChat);
    document.getElementById('closeAiChat').addEventListener('click', toggleChat);
    document.getElementById('closeAiChatMobile').addEventListener('click', toggleChat);
    document.getElementById('clearAiChat').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the chat history?')) {
            localStorage.removeItem(STORAGE_KEY);
            chatHistory = [];
            messages.innerHTML = `
                <div class="flex gap-3 text-sm">
                    <div class="shrink-0">
                        <div class="rounded-full bg-[#224796] text-white p-2 flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 max-w-[80%]">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</span>
                        <div class="bg-white border text-slate-700 p-2 px-3 rounded-2xl rounded-tl-none shadow-sm leading-tight">Hi, how can I help you today?</div>
                    </div>
                </div>
            `;
        }
    });

    // Form and History Management
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    const messages = document.getElementById('aiChatMessages');

    const STORAGE_KEY = 'ai_chat_history';
    let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Initialize UI with existing history
    if (chatHistory.length > 0) {
        // Clear default welcome message
        messages.innerHTML = '';
        chatHistory.forEach(msg => {
            renderMessage(msg.role, msg.content, false);
        });
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Add user message to UI and history
        renderMessage('user', text, true);
        chatHistory.push({ role: 'user', content: text });
        saveHistory();

        input.value = '';

        // Prepare history payload for API (excluding the just-added message)
        const historyForApi = chatHistory.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // Add "Thinking..." indicator
        const thinkingId = 'thinking-' + Date.now();
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = thinkingId;
        thinkingDiv.className = 'flex gap-3 text-sm';
        thinkingDiv.innerHTML = `
            <div class="shrink-0">
                <div class="rounded-full bg-[#224796] text-white p-2 flex items-center justify-center animate-pulse shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                </div>
            </div>
            <div class="flex flex-col gap-1 max-w-[80%]">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</span>
                <div class="bg-white border text-slate-400 p-3 rounded-2xl rounded-tl-none shadow-sm leading-relaxed italic">
                    Thinking... <span class="animate-pulse">...</span>
                </div>
            </div>
        `;
        messages.appendChild(thinkingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            // Determine API URL relative to the current location, accounting for /Project/ structure
            const isLocalhostProject = window.location.pathname.startsWith('/Project/');
            const apiUrl = isLocalhostProject ? '/Project/api/ai/chat.php' : '/api/ai/chat.php';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: historyForApi
                })
            });
            const data = await response.json();

            // Remove thinking indicator
            thinkingDiv.remove();

            if (response.status === 403 || (data.error && data.error.includes('Authentication required'))) {
                renderMessage('ai', 'Session expired. Please log in again. Chat history has been cleared.', true);
                localStorage.removeItem(STORAGE_KEY);
                chatHistory = [];
                // Optionally redirect to login
                setTimeout(() => window.location.href = '/', 2000);
            } else if (data.error) {
                renderMessage('ai', 'Error: ' + data.error, true);
                // Do not save error messages to history
            } else {
                renderMessage('ai', data.response, true);
                chatHistory.push({ role: 'ai', content: data.response });
                saveHistory();
            }
        } catch (err) {
            thinkingDiv.remove();
            renderMessage('ai', 'Could not connect to the AI service. Please try again later.', true);
        }
    });

    // Helper to format basic markdown (bold, italic, links) for UI
    function formatText(text) {
        if (!text) return '';
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Newlines -> <br>
        text = text.replace(/\\n/g, '<br/>');
        return text;
    }

    function renderMessage(sender, text, animate = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex gap-3 text-sm ${sender === 'user' ? 'flex-row-reverse' : ''}`;

        const formattedText = formatText(text);

        if (sender === 'ai') {
            msgDiv.innerHTML = `
                <div class="shrink-0">
                    <div class="rounded-full bg-[#224796] text-white p-2 flex items-center justify-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col gap-1 max-w-[80%] items-start">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</span>
                    <div class="bg-white border text-slate-700 p-2 px-3 rounded-2xl rounded-tl-none shadow-sm leading-tight break-words w-fit">${formattedText}</div>
                </div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="shrink-0 pt-1">
                    <div class="rounded-full bg-slate-200 text-slate-600 p-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" height="16" width="16">
                            <path fill="currentColor" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                        </svg>
                    </div>
                </div>
                <div class="flex flex-col gap-1 max-w-[81%] items-end">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">You</span>
                    <div class="bg-[#224796] text-white p-2 px-3 rounded-2xl rounded-tr-none shadow-sm leading-tight break-words whitespace-pre-line w-fit">${text}</div>
                </div>
            `;
        }

        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;

        if (animate) {
            msgDiv.style.opacity = '0';
            msgDiv.style.transform = 'translateY(10px)';
            msgDiv.style.transition = 'all 0.3s ease-out';
            setTimeout(() => {
                msgDiv.style.opacity = '1';
                msgDiv.style.transform = 'translateY(0)';
            }, 10);
        }
    }
}
