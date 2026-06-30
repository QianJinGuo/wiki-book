/**
 * AI Chat — 浮窗聊天面板
 * API Key 内置在 CF Worker 后端，用户零配置
 */
(function() {
  "use strict";

  var PROXY_URL = "https://ai-chat-proxy.jinguo.workers.dev";

  // ========== 文章上下文 ==========
  function getArticleContext() {
    var article = document.querySelector("article.md-content__inner");
    if (!article) return "";
    var text = article.innerText || article.textContent || "";
    if (text.length > 8000) text = text.substring(0, 8000) + "\n...(内容已截断)";
    return text;
  }

  function getArticleTitle() {
    var h1 = document.querySelector("article h1");
    return h1 ? h1.textContent.replace(/¶/g, "").trim() : document.title;
  }

  // ========== Markdown → HTML ==========
  function renderMd(text) {
    return text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*]\s+(.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>').replace(/$/, '</p>');
  }

  // ========== API 调用 ==========
  function chat(messages, onChunk, onDone, onError) {
    var body = JSON.stringify({
      messages: messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7
    });

    fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    }).then(function(resp) {
      if (!resp.ok) {
        return resp.text().then(function(t) {
          throw new Error("API error " + resp.status + ": " + t.substring(0, 200));
        });
      }
      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      var fullText = "";

      function read() {
        return reader.read().then(function(result) {
          if (result.done) { onDone(fullText); return; }
          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (!line || line === "data: [DONE]") continue;
            if (!line.startsWith("data: ")) continue;
            try {
              var data = JSON.parse(line.substring(6));
              var delta = data.choices && data.choices[0] && data.choices[0].delta;
              if (delta && delta.content) {
                fullText += delta.content;
                onChunk(fullText);
              }
            } catch(e) {}
          }
          return read();
        });
      }
      return read();
    }).catch(function(err) { onError(err.message); });
  }

  // ========== UI ==========
  function init() {
    var article = document.querySelector("article.md-content__inner");
    if (!article) return;
    if (document.querySelector(".ai-chat-trigger")) return;

    // 触发按钮
    var trigger = document.createElement("button");
    trigger.className = "ai-chat-trigger";
    trigger.innerHTML = "🤖";
    trigger.title = "Talk to AI";

    // 面板
    var panel = document.createElement("div");
    panel.className = "ai-chat-panel";

    panel.innerHTML =
      '<div class="ai-chat__header">' +
        '<span class="ai-chat__title"><span class="ai-chat__title-icon">🤖</span> Talk to AI</span>' +
        '<div class="ai-chat__actions">' +
          '<button class="ai-chat__btn" data-action="clear" title="清空">🗑</button>' +
          '<button class="ai-chat__btn" data-action="close" title="关闭">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="ai-chat__messages">' +
        '<div class="ai-chat__welcome"><span class="ai-chat__welcome-icon">💬</span><div>我是这篇文章的 AI 助手<br>可以回答关于「' + getArticleTitle().substring(0, 30) + '」的任何问题</div></div>' +
      '</div>' +
      '<div class="ai-chat__input-area">' +
        '<textarea class="ai-chat__input" rows="1" placeholder="问点什么..."></textarea>' +
        '<button class="ai-chat__mic" data-action="mic" title="语音输入">🎤</button>' +
        '<button class="ai-chat__send" data-action="send"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
      '</div>';

    document.body.appendChild(trigger);
    document.body.appendChild(panel);

    var conversationHistory = [];
    var articleContext = getArticleContext();
    var isStreaming = false;

    // 触发按钮
    trigger.addEventListener("click", function() {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) {
        var input = panel.querySelector(".ai-chat__input");
        if (input) input.focus();
      }
    });

    // ========== 拖动功能 ==========
    var header = panel.querySelector(".ai-chat__header");
    var isDragging = false;
    var startX, startY, startLeft, startTop;

    header.addEventListener("mousedown", function(e) {
      if (e.target.closest("[data-action]")) return;
      isDragging = true;
      var rect = panel.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      panel.style.left = startLeft + "px";
      panel.style.top = startTop + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      header.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newLeft = startLeft + dx;
      var newTop = startTop + dy;
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - panel.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - 60));
      panel.style.left = newLeft + "px";
      panel.style.top = newTop + "px";
      trigger.style.left = newLeft + "px";
      trigger.style.top = (newTop + panel.offsetHeight + 10) + "px";
      trigger.style.bottom = "auto";
    });

    document.addEventListener("mouseup", function() {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = "grab";
      }
    });

    // 触发按钮拖动
    var trigDragging = false;
    var trigStartX, trigStartY, trigStartLeft, trigStartTop;

    trigger.addEventListener("mousedown", function(e) {
      trigDragging = true;
      var rect = trigger.getBoundingClientRect();
      trigStartX = e.clientX;
      trigStartY = e.clientY;
      trigStartLeft = rect.left;
      trigStartTop = rect.top;
      trigger.style.left = trigStartLeft + "px";
      trigger.style.top = trigStartTop + "px";
      trigger.style.right = "auto";
      trigger.style.bottom = "auto";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function(e) {
      if (!trigDragging) return;
      var dx = e.clientX - trigStartX;
      var dy = e.clientY - trigStartY;
      var newLeft = Math.max(0, Math.min(trigStartLeft + dx, window.innerWidth - 50));
      var newTop = Math.max(0, Math.min(trigStartTop + dy, window.innerHeight - 50));
      trigger.style.left = newLeft + "px";
      trigger.style.top = newTop + "px";
    });

    document.addEventListener("mouseup", function() {
      if (trigDragging) trigDragging = false;
    });

    header.style.cursor = "grab";

    // 事件委托
    panel.addEventListener("click", function(e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var action = btn.getAttribute("data-action");

      if (action === "close") panel.classList.remove("open");

      if (action === "clear") {
        conversationHistory = [];
        var msgs = panel.querySelector(".ai-chat__messages");
        if (msgs) msgs.innerHTML = '<div class="ai-chat__welcome"><span class="ai-chat__welcome-icon">💬</span><div>对话已清空</div></div>';
      }

      if (action === "send") sendMessage();
      if (action === "mic") startListening();
    });

    // Enter 发送
    var input = panel.querySelector(".ai-chat__input");
    if (input) {
      input.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });
      input.addEventListener("input", function() {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 96) + "px";
      });
    }

    // 添加消息
    function addMsg(role, content) {
      var messages = panel.querySelector(".ai-chat__messages");
      if (!messages) return null;
      var welcome = messages.querySelector(".ai-chat__welcome");
      if (welcome) welcome.remove();

      var msg = document.createElement("div");
      msg.className = "ai-chat__msg ai-chat__msg--" + role;
      var bubble = document.createElement("div");
      bubble.className = "ai-chat__bubble";
      if (role === "assistant" && content === "") {
        bubble.innerHTML = '<div class="ai-chat__typing"><span></span><span></span><span></span></div>';
      } else {
        bubble.innerHTML = renderMd(content);
      }
      msg.appendChild(bubble);

      // AI 回复加朗读按钮
      if (role === "assistant" && content !== "") {
        var actions = document.createElement("div");
        actions.className = "ai-chat__msg-actions";
        var speakBtn = document.createElement("button");
        speakBtn.className = "ai-chat__speak-btn";
        speakBtn.innerHTML = "🔊";
        speakBtn.title = "朗读";
        speakBtn.addEventListener("click", function() {
          speakText(content, speakBtn);
        });
        actions.appendChild(speakBtn);
        msg.appendChild(actions);
      }

      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
      return bubble;
    }

    // ========== 语音合成 (MiMo TTS) ==========
    var TTS_PROXY_URL = "https://tts-proxy.jinguo.workers.dev";
    var isSpeaking = false;

    function speakText(text, btn) {
      if (isSpeaking) {
        var existing = document.getElementById("ai-chat-audio");
        if (existing) { existing.pause(); existing.remove(); }
        isSpeaking = false;
        btn.textContent = "🔊";
        btn.classList.remove("speaking");
        return;
      }

      var cleanText = text.replace(/[*_`#\[\]()]/g, "").replace(/\n+/g, "。");
      if (cleanText.length > 1000) cleanText = cleanText.substring(0, 1000) + "...";

      btn.textContent = "⏳";
      btn.classList.add("speaking");

      fetch(TTS_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, model: "mimo-v2.5-tts" })
      }).then(function(resp) { return resp.json(); }).then(function(data) {
        if (data.error) {
          console.error("TTS error:", data.error);
          btn.textContent = "🔊";
          btn.classList.remove("speaking");
          return;
        }

        var binaryStr = atob(data.audio);
        var bytes = new Uint8Array(binaryStr.length);
        for (var i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        var wavBuffer = pcmToWav(bytes.buffer, data.sampleRate || 24000);
        var blob = new Blob([wavBuffer], { type: "audio/wav" });
        var url = URL.createObjectURL(blob);

        var audio = new Audio(url);
        audio.id = "ai-chat-audio";
        document.body.appendChild(audio);

        isSpeaking = true;
        btn.textContent = "⏹";

        audio.onended = function() {
          isSpeaking = false;
          btn.textContent = "🔊";
          btn.classList.remove("speaking");
          URL.revokeObjectURL(url);
          audio.remove();
        };
        audio.onerror = function() {
          isSpeaking = false;
          btn.textContent = "🔊";
          btn.classList.remove("speaking");
          URL.revokeObjectURL(url);
          audio.remove();
        };

        audio.play();
      }).catch(function(err) {
        console.error("TTS fetch error:", err);
        btn.textContent = "🔊";
        btn.classList.remove("speaking");
      });
    }

    // PCM16LE → WAV
    function pcmToWav(pcmBuffer, sampleRate) {
      var pcm16 = new Int16Array(pcmBuffer);
      var numChannels = 1;
      var bitsPerSample = 16;
      var byteRate = sampleRate * numChannels * bitsPerSample / 8;
      var blockAlign = numChannels * bitsPerSample / 8;
      var dataSize = pcm16.length * 2;
      var buffer = new ArrayBuffer(44 + dataSize);
      var view = new DataView(buffer);

      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + dataSize, true);
      writeString(view, 8, "WAVE");
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(view, 36, "data");
      view.setUint32(40, dataSize, true);
      var offset = 44;
      for (var i = 0; i < pcm16.length; i++) {
        view.setInt16(offset, pcm16[i], true);
        offset += 2;
      }
      return buffer;
    }

    function writeString(view, offset, str) {
      for (var i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    // ========== 语音识别 (STT) ==========
    var recognition = null;
    var isListening = false;

    function startListening() {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { alert("浏览器不支持语音识别（请使用 Chrome/Edge）"); return; }

      if (isListening) {
        stopListening();
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.continuous = false;
      recognition.interimResults = true;

      var micBtn = panel.querySelector(".ai-chat__mic");

      recognition.onresult = function(event) {
        var transcript = "";
        for (var i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        var inputEl = panel.querySelector(".ai-chat__input");
        if (inputEl) inputEl.value = transcript;
      };

      recognition.onend = function() {
        isListening = false;
        if (micBtn) { micBtn.classList.remove("listening"); micBtn.textContent = "🎤"; }
      };

      recognition.onerror = function() {
        isListening = false;
        if (micBtn) { micBtn.classList.remove("listening"); micBtn.textContent = "🎤"; }
      };

      recognition.start();
      isListening = true;
      if (micBtn) { micBtn.classList.add("listening"); micBtn.textContent = "🔴"; }
    }

    function stopListening() {
      if (recognition) { recognition.stop(); recognition = null; }
      isListening = false;
      var micBtn = panel.querySelector(".ai-chat__mic");
      if (micBtn) { micBtn.classList.remove("listening"); micBtn.textContent = "🎤"; }
    }

    // ========== 发送消息 ==========
    function sendMessage() {
      var inputEl = panel.querySelector(".ai-chat__input");
      if (!inputEl) return;
      var text = inputEl.value.trim();
      if (!text || isStreaming) return;

      inputEl.value = "";
      inputEl.style.height = "auto";
      addMsg("user", text);

      conversationHistory.push({ role: "user", content: text });

      var systemMsg = {
        role: "system",
        content: "你是一个 AI 助手，正在回答用户关于以下文章的问题。请用简洁的中文回答。\n\n文章内容：\n" + articleContext
      };

      var messages = [systemMsg].concat(conversationHistory);

      var bubble = addMsg("assistant", "");
      isStreaming = true;

      chat(messages,
        function(fullText) {
          if (bubble) bubble.innerHTML = renderMd(fullText);
          var msgs = panel.querySelector(".ai-chat__messages");
          if (msgs) msgs.scrollTop = msgs.scrollHeight;
        },
        function(fullText) {
          isStreaming = false;
          conversationHistory.push({ role: "assistant", content: fullText });
          if (bubble) {
            bubble.innerHTML = renderMd(fullText);
            // 添加朗读按钮
            var msgEl = bubble.closest(".ai-chat__msg");
            if (msgEl && !msgEl.querySelector(".ai-chat__msg-actions")) {
              var actions = document.createElement("div");
              actions.className = "ai-chat__msg-actions";
              var speakBtn = document.createElement("button");
              speakBtn.className = "ai-chat__speak-btn";
              speakBtn.innerHTML = "🔊";
              speakBtn.title = "朗读";
              speakBtn.addEventListener("click", function() {
                speakText(fullText, speakBtn);
              });
              actions.appendChild(speakBtn);
              msgEl.appendChild(actions);
            }
          }
        },
        function(err) {
          isStreaming = false;
          if (bubble) bubble.innerHTML = '<span style="color:#e74c3c">错误: ' + err + '</span>';
        }
      );
    }
  }

  // 启动
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
