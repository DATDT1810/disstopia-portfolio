const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_API_KEY = window.DISSTOPIA_GEMINI_API_KEY || "";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const promptButtons = document.querySelectorAll("[data-prompt]");
const videoTiles = document.querySelectorAll(".video-tile video");
const chatHistory = [];

const systemInstruction = `
Bạn là DISSTOPIA Love Signal, chatbot tương tác trong portfolio dự án DISSTOPIA.

Nhiệm vụ:
- Trò chuyện với người xem về băn khoăn tình cảm, tín hiệu mập mờ, nhắn tin nóng lạnh, overthinking và cảm giác cần được xác nhận.
- Trả lời bằng tiếng Việt tự nhiên, mềm, có chiều sâu, hơi bí ẩn đúng mood DISSTOPIA nhưng vẫn dễ hiểu.
- Không trả lời cụt. Mỗi câu trả lời nên có 4 đến 6 câu, khoảng 90 đến 150 từ.
- Không khẳng định chắc chắn người kia yêu hay không yêu.
- Không chẩn đoán sức khỏe tinh thần.
- Luôn giúp người xem nhìn lại pattern hành động, cảm xúc của chính họ, và đặt thêm 1 câu hỏi cụ thể ở cuối.

Nếu người xem nói họ liên tục kiểm tra dấu hiệu, hãy nhấn mạnh rằng việc tìm dấu hiệu có thể là một dạng tự bảo vệ, nhưng cũng có thể biến thành vòng lặp làm họ mệt hơn.
Nếu người xem hỏi người kia có yêu mình không, hãy hướng họ quan sát sự nhất quán, chủ động, tôn trọng ranh giới và hành động lặp lại theo thời gian.
`;

function addMessage(text, type) {
  const node = document.createElement("div");
  node.className = `message ${type}`;
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
  return node;
}

function setTyping(active) {
  const existing = document.querySelector("[data-typing='true']");
  if (existing) existing.remove();
  if (!active) return null;

  const node = addMessage("DISSTOPIA đang phân tích tín hiệu...", "system");
  node.dataset.typing = "true";
  return node;
}

function getApiKey() {
  return GEMINI_API_KEY.trim();
}

function toGeminiContents() {
  return chatHistory.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }]
  }));
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || "").join("").trim();
}

function isWeakAnswer(answer) {
  const trimmed = answer.trim();
  const sentenceCount = (trimmed.match(/[.!?。！？]/g) || []).length;
  return trimmed.length < 120 || sentenceCount < 2;
}

function getFallbackReply(input) {
  const normalized = input.toLowerCase();

  if (normalized.includes("yêu") || normalized.includes("thích") || normalized.includes("love")) {
    return "Tín hiệu tình cảm hiếm khi rõ ngay từ một khoảnh khắc. Thay vì hỏi một hành động đơn lẻ có nghĩa là gì, bạn hãy nhìn vào sự nhất quán: họ có chủ động không, có giữ lời không, có quan tâm cả khi không cần gây ấn tượng không? Nếu câu trả lời cứ lúc có lúc không, cảm giác bất an của bạn cũng là một dữ kiện đáng lắng nghe. DISSTOPIA không thể kết luận thay bạn rằng họ yêu hay không, nhưng có thể nhắc bạn rằng tình yêu là pattern, không phải một tín hiệu lẻ. Bạn thấy họ nhất quán nhất ở điểm nào, và thiếu nhất quán nhất ở điểm nào?";
  }

  if (normalized.includes("nhắn") || normalized.includes("seen") || normalized.includes("im lặng") || normalized.includes("nóng lạnh")) {
    return "Một người lúc gần lúc xa rất dễ khiến bạn tự đi tìm thêm bằng chứng. Khi họ nhắn, bạn thấy có hy vọng; khi họ im lặng, toàn bộ hệ thống trong bạn lại bắt đầu quét lỗi. Nhưng một mối quan hệ lành mạnh không nên chỉ tồn tại nhờ vài đoạn tin nhắn làm bạn đoán già đoán non. Hãy thử quan sát trong vài ngày: họ có quay lại bằng hành động rõ ràng, hay chỉ xuất hiện đủ để bạn tiếp tục chờ? Khoảnh khắc nào khiến bạn thấy mình bình yên nhất khi ở cạnh họ?";
  }

  if (normalized.includes("dấu hiệu") || normalized.includes("kiểm tra") || normalized.includes("ám ảnh") || normalized.includes("theo dõi")) {
    return "Việc liên tục tìm kiếm dấu hiệu thường bắt đầu như một cách tự bảo vệ: bạn muốn chắc rằng mình không bị bỏ rơi, không hiểu sai, không yêu một mình. Nhưng nếu càng kiểm tra bạn càng mệt, thì có thể vấn đề không chỉ nằm ở họ, mà còn nằm ở vòng lặp mà mối quan hệ này đang kích hoạt trong bạn. Một tín hiệu thật nên làm bạn thấy rõ hơn, không phải khiến bạn phải giải mã mãi. Hãy tạm nhìn vào pattern lớn: họ có khiến bạn thấy được chọn một cách ổn định không? Bạn đang tìm dấu hiệu vì họ mập mờ, hay vì bạn đã mất cảm giác an toàn?";
  }

  return "Tín hiệu bạn đưa ra vẫn còn hơi nhiễu, nhưng chính sự nhiễu đó cũng là một phần của câu chuyện. Khi một điều làm mình băn khoăn quá lâu, nó thường không chỉ là câu hỏi về người kia, mà còn là câu hỏi về cảm giác an toàn của mình trong mối quan hệ đó. Bạn có thể thử tách ra ba lớp: họ đã làm gì, việc đó lặp lại bao nhiêu lần, và cơ thể bạn cảm thấy thế nào sau mỗi lần như vậy. DISSTOPIA sẽ không kết luận thay bạn, nhưng sẽ giúp bạn đọc pattern rõ hơn. Bạn kể một tình huống cụ thể vừa xảy ra được không?";
}

function isQuotaError(error) {
  const message = error.message.toLowerCase();
  return message.includes("quota") || message.includes("rate") || message.includes("429");
}

function isBusyModelError(error) {
  const message = error.message.toLowerCase();
  return message.includes("high demand") || message.includes("unavailable") || message.includes("503");
}

async function askGemini(userText) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    return getFallbackReply(userText);
  }

  chatHistory.push({ role: "user", text: userText });

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: toGeminiContents(),
      generationConfig: {
        temperature: 0.78,
        topP: 0.9,
        maxOutputTokens: 520
      }
    })
  });

  if (!response.ok) {
    const details = await response.json().catch(() => null);
    const message = details?.error?.message || `Gemini API returned ${response.status}.`;
    throw new Error(message);
  }

  const data = await response.json();
  const answer = extractGeminiText(data);
  const finalAnswer = isWeakAnswer(answer) ? getFallbackReply(userText) : answer;
  chatHistory.push({ role: "model", text: finalAnswer });
  return finalAnswer;
}

async function submitPrompt(value) {
  const text = value.trim();
  if (!text) return;

  addMessage(text, "viewer");
  chatInput.value = "";
  setTyping(true);

  try {
    const answer = await askGemini(text);
    setTyping(false);
    addMessage(answer, "system");
  } catch (error) {
    chatHistory.pop();
    setTyping(false);

    if (isQuotaError(error)) {
      addMessage(`Gemini đang hết quota nên DISSTOPIA chuyển sang chế độ dự phòng. ${getFallbackReply(text)}`, "system");
      return;
    }

    if (isBusyModelError(error)) {
      addMessage(`Gemini 3.5 Flash đang quá tải tạm thời nên DISSTOPIA chuyển sang chế độ dự phòng. ${getFallbackReply(text)}`, "system");
      return;
    }

    addMessage(`Gemini chưa phản hồi được. ${getFallbackReply(text)}`, "system");
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPrompt(chatInput.value);
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    submitPrompt(button.dataset.prompt || "");
  });
});

videoTiles.forEach((video) => {
  video.addEventListener("mouseenter", () => video.play().catch(() => {}));
  video.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.55 }
);

videoTiles.forEach((video) => observer.observe(video));
