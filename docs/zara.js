

    const plusBtn = document.getElementById("plus-btn");
    const plusMenu = document.getElementById("plus-menu");
    const plusIcon = plusBtn.querySelector("i");

    const imageModeBtn = document.getElementById("image-mode-btn");
    const videoModeBtn = document.getElementById("video-mode-btn");

    const modeIndicator = document.getElementById("mode-indicator");
    const modeText = document.getElementById("mode-text");
    const cancelMode = document.getElementById("cancel-mode");

    let menuOpen = false;
    let generateMode = null;

        // Toggle Plus Menu
        plusBtn.addEventListener("click", () => {
            if (generateMode) return; // agar mode active hai, menu toggle disable
    menuOpen = !menuOpen;

    if (menuOpen) {
        plusMenu.style.display = "flex";
    plusIcon.classList.remove("bi-plus-circle");
    plusIcon.classList.add("bi-x-circle");
            } else {
        plusMenu.style.display = "none";
    plusIcon.classList.remove("bi-x-circle");
    plusIcon.classList.add("bi-plus-circle");
            }
        });

    // Function to activate mode
    function activateMode(mode) {
        generateMode = mode;

    // Show mode indicator with close button
    modeIndicator.classList.remove("hidden");
    modeText.innerText = mode === "image" ? "📷 Image Mode Active" : "🎬 Video Mode Active";

    // Menu hide
    plusMenu.style.display = "none";

    // Disable plus button while mode active
    plusIcon.classList.remove("bi-plus-circle");
    plusIcon.classList.add("bi-x-circle");

    // Hide the other button in menu
    if (mode === "image") videoModeBtn.style.display = "none";
    if (mode === "video") imageModeBtn.style.display = "none";
        }

        // Event listeners for mode buttons
        imageModeBtn.addEventListener("click", () => activateMode("image"));
        videoModeBtn.addEventListener("click", () => activateMode("video"));

        // Cancel button to deactivate mode
        cancelMode.addEventListener("click", () => {
        generateMode = null;

    // Hide mode indicator
    modeIndicator.classList.add("hidden");

    // Reset menu buttons visibility
    imageModeBtn.style.display = "block";
    videoModeBtn.style.display = "block";

    // Reset plus button
    plusIcon.classList.remove("bi-x-circle");
    plusIcon.classList.add("bi-plus-circle");

    menuOpen = false;
    plusMenu.style.display = "none";
        });


    async function sendToBackend(userText) {
            const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify({message: userText })
            });

    const data = await res.json();
    return data.reply;
        }
    async function generateImage(prompt) {
            const res = await fetch("http://localhost:5000/api/image", {
        method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify({prompt})
            });

    const data = await res.json();
    return data.image;
        }
    async function generateVideo(prompt) {
        const res = await fetch("http://localhost:5000/api/video", {
        method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify({prompt})
        });

    const data = await res.json();

    if (!data.video) {
        alert("❌ Video blocked by AI moderation. Try different prompt.");
    return null;
        }

    return data.video;
    }


    (function () {
            // Elements
            //  const chat = chatHistory.getElementsByTagName('li');
            const chatSearch = document.getElementById('chat-search');
    const micBtn = document.querySelector('.mic-icon');
    const siriWrap = document.getElementById('siriWave');
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const chatContainer = document.getElementById("chat-container");
    const fileInput = document.getElementById("file-upload");
    const previewContainer = document.getElementById("preview-container");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsPanel = document.getElementById("settings-panel");
    const closeBtn = document.getElementById("close-settings");
    const newChatBtn = document.getElementById("new-chat-btn");
    const chatHistoryList = document.getElementById("chat-history");
    const themeBtn = document.getElementById("theme");
    const darkToggle = document.getElementById("dark-mode-toggle");
    const welcomeHeading = document.getElementById("welcome-heading");


    // State
    let uploadedFiles = [];
    let chats = []; // {id, name, messages: [{type:'text'|'image', sender:'user'|'bot', text?, data?}]}
    let currentChat = null;
    let firstMessageSent = false;



    // Helpers: storage
    function loadChatsFromStorage() {
                try {
                    const raw = localStorage.getItem("chatsData");
    chats = raw ? JSON.parse(raw) : [];
                } catch (e) {
        console.error("Failed to parse chatsData:", e);
    chats = [];
                }
            }
    function saveChatsToStorage() {
                try {
        localStorage.setItem("chatsData", JSON.stringify(chats));
                } catch (e) {
        console.error("Failed to save chatsData:", e);
                }
            }


    // Render chat history list
    function renderChatHistory() {
        chatHistoryList.innerHTML = "";
                chats.forEach(ch => {
                    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const span = document.createElement("span");
    span.textContent = ch.name || ("Chat " + ch.id);
    span.style.flex = "1";
    span.style.cursor = "pointer";
                    span.addEventListener("click", () => {
        currentChat = ch.id;
    loadChat(ch.id);
    settingsPanel.classList.remove("open");
                    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.style.background = "transparent";
    delBtn.style.border = "none";
    delBtn.style.color = "red";
    delBtn.style.cursor = "pointer";
    delBtn.title = "Delete chat";
                    delBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent chat from loading
    if (confirm("Delete this chat?")) {
        chats = chats.filter(c => c.id !== ch.id);
    saveChatsToStorage();
    renderChatHistory();
    if (currentChat === ch.id) {
        currentChat = null;
    chatContainer.innerHTML = "";
    welcomeHeading.style.display = "block";
                            }
                        }
                    });

    li.appendChild(span);
    li.appendChild(delBtn);
    chatHistoryList.appendChild(li);
                });
            }
    // --- Chat history search ---
    if (chatSearch) {
        chatSearch.addEventListener('input', function () {
            const filter = chatSearch.value.toLowerCase();
            const items = chatHistoryList.getElementsByTagName('li');
            for (let i = 0; i < items.length; i++) {
                const span = items[i].querySelector('span');
                const text = span ? span.textContent || span.innerText : '';
                items[i].style.display = text.toLowerCase().includes(filter) ? '' : 'none';
            }
        });
            }

    // --- Siri Wave setup ---

    // 24 bars banao different delay/amp ke saath
    (function buildSiriBars() {
                const bars = 24;
    for (let i = 0; i < bars; i++) {
                    const b = document.createElement('div');
    b.className = 'siri-bar';
    // center ke bars thode bade, edges chhote (Siri feel)
    const center = Math.abs(i - (bars - 1) / 2);
    const amp = 1.4 - (center / (bars / 2)) * 0.9; // 1.4 .. 0.5
    b.style.setProperty('--amp', amp.toFixed(2));
    b.style.animationDelay = `${(i % 6) * 0.08}s`;
    siriWrap.appendChild(b);
                }
            })();

    // toggle state
    let isListening = false;
    let waveEl = null;
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "hi-IN"; // Hindi
    recognition.interimResults = false;

    function speak(text) {
                const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    window.speechSynthesis.speak(utterance);
            }
            micBtn.addEventListener('click', () => {
        isListening = !isListening;

    if (isListening) {
        // wave element create
        waveEl = document.createElement('div');
    waveEl.className = 'body-wave';
    document.body.appendChild(waveEl);
    siriWrap.classList.add('active');
    micBtn.classList.add('mic-listening');
    recognition.start(); // 🎤 start listening
                } else {
        // wave stop
        stopRecognition();
                }
    function stopRecognition() {
        siriWrap.classList.remove('active');
    micBtn.classList.remove('mic-listening');
    recognition.stop();
    if (waveEl) {
        waveEl.remove();
    waveEl = null;
                    }
                }

                recognition.onresult = async (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log("You said:", transcript);

    // AI bolne se pehle recognition ko rok do
    recognition.abort();

    try {
                        const reply = await sendToBackend(transcript);

    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = "hi-IN";

                        utterance.onend = () => {
                            // Jab AI bolna khatam kare, tab dobara recognition start karo
                            if (isListening) recognition.start();
                        };

    speechSynthesis.speak(utterance);

                    } catch (err) {
        console.error("AI error:", err);
    if (isListening) recognition.start();
                    }
                };

                recognition.onend = () => {
                    // Agar AI bol raha ho to start mat karna, sirf user stop ke liye
                    if (isListening && !speechSynthesis.speaking) {
        recognition.start();
                    }
                };
            });

    function markdownToHTML(text) {
        let html = text
    // Headings ko emoji ke sath
    .replace(/^### (.*$)/gim, "🤖 <h3>$1</h3>")
    .replace(/^## (.*$)/gim, "⭐ <h2>$1</h2>")
    .replace(/^# (.*$)/gim, "📌 <h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    // Italic
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    // Bullet list
    .replace(/^\s*[-*]\s+(.*)/gim, "• $1")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Line breaks
    .replace(/\n/g, "<br>");
        return html.trim();
            }
        // --- Fullscreen Image Helper ---
        function showImageFullscreen(src) {
                const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.cursor = "zoom-out";
        overlay.style.zIndex = "9999";
        overlay.style.transition = "opacity 0.3s ease";
        overlay.style.opacity = "0";

        const img = document.createElement("img");
        img.src = src;
        img.style.maxWidth = "90%";
        img.style.maxHeight = "90%";
        img.style.borderRadius = "10px";
        img.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
        img.style.transform = "scale(0.9)";
        img.style.transition = "transform 0.3s ease";
        overlay.appendChild(img);

                overlay.addEventListener("click", () => {
            img.style.transform = "scale(0.9)";
        overlay.style.opacity = "0";
                    setTimeout(() => overlay.remove(), 300);
                });

        document.body.appendChild(overlay);
                requestAnimationFrame(() => {
            overlay.style.opacity = "1";
        img.style.transform = "scale(1)";
                });
            }

        // --- Make all images in a container clickable ---
        function makeImagesFullscreen(container) {
                const imgs = container.querySelectorAll("img");
                imgs.forEach(img => {
            img.style.cursor = "zoom-in";
        if (!img.dataset.fullscreen) { // avoid duplicate listeners
            img.dataset.fullscreen = "true";
                        img.addEventListener("click", () => showImageFullscreen(img.src));
                    }
                });
            }

        // Load a chat into UI
        function loadChat(chatId) {
                const chatObj = chats.find(c => c.id === chatId);
        if (!chatObj) return;
        chatContainer.innerHTML = "";
                chatObj.messages.forEach(m => {
                    if (m.type === "image") {
                        const img = document.createElement("img");
        img.src = m.data;
        img.style.maxWidth = "240px";
        img.style.borderRadius = "10px";
        img.style.margin = "6px 0";
        if (m.sender === "user") img.style.marginLeft = "auto";
        chatContainer.appendChild(img);
                    } else {
            addMessageToUI(m.sender, m.text);
                    }
                });
        makeImagesFullscreen(chatContainer); // ✅ Fullscreen listener add
        welcomeHeading.style.display = "none";
        chatContainer.scrollTop = chatContainer.scrollHeight;
            }

        // Add message UI only
        function addMessageToUI(sender, text) {
                const div = document.createElement("div");
        div.classList.add("message", sender === "user" ? "user" : "bot");
        div.innerText = text;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return div;
            }

        // Save message to storage for current chat
        function saveMessageToChat(msg) {
                if (!currentChat) {
                    // create a new chat automatically
                    const chatName = "Chat " + (chats.length + 1);
        const newChat = {id: Date.now(), name: chatName, messages: [] };
        chats.push(newChat);
        currentChat = newChat.id;
                }
                const chatObj = chats.find(c => c.id === currentChat);
        if (!chatObj) return;
        chatObj.messages.push(msg);
        saveChatsToStorage();
        renderChatHistory();
            }

        // Render preview thumbnails
        function renderPreview() {
            previewContainer.innerHTML = "";
                uploadedFiles.forEach((file, idx) => {
                    if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
                    reader.onload = e => {
                        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";

        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "6px";

        const close = document.createElement("button");
        close.innerText = "✕";
        close.title = "Remove";
        Object.assign(close.style, {position: "absolute", top: "-6px", right: "-6px", background: "rgba(0,0,0,.6)", color: "#fff", border: "none", width: "18px", height: "18px", borderRadius: "50%", cursor: "pointer" });
                        close.addEventListener("click", () => {
            uploadedFiles.splice(idx, 1);
        renderPreview();
                        });

        wrapper.appendChild(img);
        wrapper.appendChild(close);
        previewContainer.appendChild(wrapper);
                    };
        reader.readAsDataURL(file);
                });
            }

        // Auto-resize contenteditable (approx)
        function adjustInputHeight() {
            // We can't reliably use scrollHeight on contenteditable for all browsers. Keep minimal
            input.style.minHeight = "56px";
            }

        // Event handlers
        input.addEventListener("input", adjustInputHeight);

            fileInput.addEventListener("change", (e) => {
                const files = Array.from(e.target.files || []);
        uploadedFiles.push(...files);
        renderPreview();
            });




            settingsBtn.addEventListener("click", () => settingsPanel.classList.toggle("open"));
            closeBtn.addEventListener("click", () => settingsPanel.classList.remove("open"));

            themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            });
            darkToggle.addEventListener("change", (e) => {
            document.body.classList.toggle("dark-theme", e.target.checked);
            });

            newChatBtn.addEventListener("click", () => {
                const name = prompt("Enter chat name:") || ("Chat " + (chats.length + 1));
        const newChat = {id: Date.now(), name, messages: [] };
        chats.push(newChat);
        saveChatsToStorage();
        renderChatHistory();
        currentChat = newChat.id;
        chatContainer.innerHTML = "";
        welcomeHeading.style.display = "none";
            });
        async function typeWriterEffect(element, text, speed = 200) {
            element.innerText = "";
        const words = text.split(" "); // split by space
        for (let i = 0; i < words.length; i++) {
            element.innerText += (i === 0 ? "" : " ") + words[i];
                    await new Promise(resolve => setTimeout(resolve, speed));
        chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }
        // ---- Clean Markdown properly ----
        function cleanMarkdown(text) {
                return text
        // Code blocks hatao
        .replace(/```[\s\S]*?```/g, "")
        // Inline code hatao
        .replace(/`([^`]+)`/g, "$1")
        // Headings hatao (#, ##, ###)
        .replace(/^#+\s?/gm, "")
        // Bold / Italic
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/_(.*?)_/g, "$1")
        // Links [text](url) => text
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
                    // Blockquotes
                    .replace(/^>\s?/gm, "")
        // Lists
        .replace(/^\s*[-*]\s+/gm, "• ")
        .replace(/^\s*\d+\.\s+/gm, "• ")
        // Tables ke pipes hatao
        .replace(/\|/g, " ")
        // Extra newlines clean karo
        .replace(/\n{2,}/g, "\n")
        .trim();
            }

        // ---- Placeholder add karne ke liye ----
        function addPlaceholderMessage(sender) {
                const msgBox = document.createElement("div");
        msgBox.className = `msg ${sender} thinking`;

        msgBox.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
        `;

        chatContainer.appendChild(msgBox);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return msgBox;
            }

        // ---- Updated generateAIResponse ----
        async function generateAIResponse(userText) {
                const chatObj = chats.find(c => c.id === currentChat);
        let historyText = "";

        if (chatObj && chatObj.messages.length) {
            chatObj.messages.forEach(m => {
                if (m.type === "text") {
                    historyText += `${m.sender === "user" ? "User" : "AI"}: ${m.text}\n`;
                }
            });
                }

        // placeholder message
        const placeholder = addPlaceholderMessage("bot");

        try {
                    // ✅ Only generate image if mode is explicitly "image"
                    if (generateMode === "image") {
                        const img = await generateImage(userText);

        if (!img) {
                            return {text: "❌ AI Image Response Failed", image: null };
                        }

        return {text: "Here is your image 👇", image: img };
                    }
                    //   if (generateMode === "video") {
                    //     const video = await generateVideo(userText);
                    //     if (!video) return {text: "❌ Video generate nahi hui", video: null };
                    //     return {text: "🎬 Ye rahi aapki video 👇", video: video };
                    // }
                    else {
                        // Normal text AI response
                        const fullPrompt = historyText + `User: ${userText}\nAI:`;
        const reply = await sendToBackend(fullPrompt);

        if (!reply || reply.trim() === "") {
                            return {text: "❌ AI Response Failed", image: null };
                        }

        return {text: reply, image: null };
                    }

                } catch (err) {
            console.error(err);
        return {text: "❌ AI Response Failed", image: null };

                } finally {
                    if (placeholder) placeholder.remove();
                }
            }



            // --- AI Response ---
            // Submit form (send)
            form.addEventListener("submit", async (ev) => {
            ev.preventDefault();
        const userText = input.innerText.trim();

        if (!userText && uploadedFiles.length === 0) return;

        // hide welcome

        const heading = document.getElementById("welcome-heading");
        if (heading) heading.style.display = "none";
        // ---- Pehla message bhejne par theme change karo ----
        if (!firstMessageSent) {
            document.body.classList.add("active-chat"); // background change
        firstMessageSent = true;

                    setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
                    }, 10);
                }
        const messageBlock = document.createElement("div");
        messageBlock.style.display = "flex";
        messageBlock.style.flexDirection = "column";
        messageBlock.style.alignItems = "flex-end";
        messageBlock.style.marginBottom = "10px";

        // message block for images then text
        // first images

        // --- Show uploaded images ---
        if (uploadedFiles.length) {
                    for (let file of uploadedFiles) {
                        if (file.type.startsWith("image/")) {
                            const reader = new FileReader();
                            await new Promise(resolve => {
            reader.onload = e => {
                const dataUrl = e.target.result;
                const img = document.createElement("img");

                img.src = dataUrl;
                img.style.maxWidth = "240px";
                img.style.borderRadius = "10px";
                img.style.margin = "6px 0";
                img.style.display = "block";
                img.style.marginLeft = "auto";
                img.style.cursor = "zoom-in";
                chatContainer.appendChild(img);
                // 🔁 Fullscreen click listener 
                img.addEventListener("click", () => showImageFullscreen(img.src));

                // --- Download button ---
                const downloadLink = document.createElement("a");
                downloadLink.href = dataUrl;
                downloadLink.download = file.name;
                downloadLink.innerText = "⬇️ Download";

                downloadLink.style.display = "inline-block";
                downloadLink.style.margin = "2px 0 8px 4px";
                downloadLink.style.padding = "0";
                downloadLink.style.fontSize = "14px";
                downloadLink.style.color = "#4CAF50";
                downloadLink.style.background = "none";
                downloadLink.style.border = "none";
                downloadLink.style.borderRadius = "0";
                downloadLink.style.textDecoration = "none";
                downloadLink.style.cursor = "pointer";
                downloadLink.style.marginLeft = "auto";

                chatContainer.appendChild(downloadLink);


                saveMessageToChat({ type: "image", sender: "user", data: dataUrl });
                chatContainer.scrollTop = chatContainer.scrollHeight;
                uploadedFiles = [];
                previewContainer.innerHTML = "";
                fileInput.value = "";
                resolve();
            };
        reader.readAsDataURL(file);
                            });
                        }
                    }
                }


        // then text
        if (userText) {
            addMessageToUI("user", userText);
        saveMessageToChat({type: "text", sender: "user", text: userText });
        input.innerText = "";
        adjustInputHeight();
                }

        // ✅ Word-by-word typing effect (with proper spaces)
        // ✅ Markdown cleaner function

        // show bot thinking
        const botDiv = document.createElement("div");
        botDiv.classList.add("message", "bot");
        chatContainer.appendChild(botDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        // Generate AI response

        const aiReply = await generateAIResponse(userText);
        console.log("AI Reply:", aiReply);


        // Show text reply
        if (aiReply.text) {
            await typeWriterEffect(botDiv, aiReply.text, 40);
        saveMessageToChat({type: "text", sender: "bot", text: aiReply.text });
                    // reset inputs

                }


        // Call backend (if available) — fallback to canned reply

        if (aiReply.image) {
                    const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "flex-start";

        const botImg = document.createElement("img");
        botImg.src = aiReply.image;
        botImg.style.maxWidth = "240px";
        botImg.style.borderRadius = "10px";
        botImg.style.margin = "6px 0";
        botImg.style.cursor = "zoom-in";

                    botImg.addEventListener("click", () => showImageFullscreen(botImg.src));

        wrapper.appendChild(botImg);
        chatContainer.appendChild(wrapper);

        const downloadLink = document.createElement("a");
        downloadLink.href = aiReply.image;
        downloadLink.download = "AI_Image.png";
        downloadLink.innerText = "⬇️ Download";
        downloadLink.style.display = "inline-block";
        downloadLink.style.margin = "2px 0 8px 4px";
        downloadLink.style.padding = "0";
        downloadLink.style.fontSize = "14px";
        downloadLink.style.color = "#4CAF50";
        downloadLink.style.background = "none";
        downloadLink.style.border = "none";
        downloadLink.style.borderRadius = "0";
        downloadLink.style.textDecoration = "none";
        downloadLink.style.cursor = "pointer";
        downloadLink.style.float = "right";
        chatContainer.appendChild(downloadLink);



        chatContainer.scrollTop = chatContainer.scrollHeight;

        saveMessageToChat({type: "image", sender: "bot", data: aiReply.image });
                }
        if (aiReply.video) {
                    const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "flex-start";

        const video = document.createElement("video");
        video.src = aiReply.video;
        video.controls = true;
        video.style.maxWidth = "260px";
        video.style.borderRadius = "10px";
        video.style.margin = "6px 0";

        wrapper.appendChild(video);

        const downloadLink = document.createElement("a");
        downloadLink.href = aiReply.video;
        downloadLink.download = "AI_Video.mp4";
        downloadLink.innerText = "⬇️ Download";
        downloadLink.style.fontSize = "14px";
        downloadLink.style.color = "#4CAF50";
        downloadLink.style.textDecoration = "none";

        wrapper.appendChild(downloadLink);
        chatContainer.appendChild(wrapper);

        saveMessageToChat({type: "video", sender: "bot", data: aiReply.video });
                }



            });


        // Initialization
        loadChatsFromStorage();
        renderChatHistory();
        // If there is at least one chat, auto-open the last one
        if (!chats.length) {
            welcomeHeading.style.display = "block";
            } else {
            welcomeHeading.style.display = "block"; // force show even if chats exist
            }
        // Expose for debugging (optional)
        window._zara = {chats, saveChatsToStorage, loadChatsFromStorage};
        })();
