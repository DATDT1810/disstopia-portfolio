const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const quickReplies = document.querySelector("#quickReplies");
const mediaVideos = document.querySelectorAll("video");
const orbitNext = document.querySelector("#orbitNext");
const orbitTrackNumber = document.querySelector("#orbitTrackNumber");
const orbitTrackTitle = document.querySelector("#orbitTrackTitle");
const orbitCards = document.querySelectorAll(".orbit-card");

const orbitTracks = [
  "Giữa một vạn người",
  "Căn phòng khiêu vũ",
  "Tình yêu có nghĩa là gì?",
  "Nếu lúc đó",
  "Thế giới không anh",
  "Becoming"
];

let orbitTrackIndex = 0;

const geminiKey =
  window.DISSTOPIA_GEMINI_API_KEY ||
  window.DISSTOPIA_CONFIG?.GeminiAPIKey ||
  "";
const geminiModel =
  window.DISSTOPIA_GEMINI_MODEL ||
  window.DISSTOPIA_CONFIG?.GeminiModel ||
  "gemini-2.0-flash";

const fallbackReplies = [
  {
    keywords: ["hi", "hello", "chào", "alo", "hey"],
    reply:
      "Chào bạn. Disstopkl ở đây để cùng bạn đọc một tín hiệu tình cảm đang làm bạn phân vân. Bạn có thể kể ngắn tình huống, hoặc chọn một gợi ý bên dưới để bắt đầu."
  },
  {
    keywords: ["yêu", "thích", "crush", "có tình cảm", "có yêu"],
    reply:
      "Khi mình không chắc người kia có tình cảm hay không, điều đáng nhìn nhất không phải một khoảnh khắc riêng lẻ mà là sự nhất quán. Họ có chủ động không, có giữ lời không, và có quan tâm đến cảm giác của bạn ngay cả khi không cần gây ấn tượng không?"
  },
  {
    keywords: ["seen", "rep", "reply", "nhắn", "tin nhắn", "im lặng", "biến mất"],
    reply:
      "Sự im lặng dễ làm mình tự lấp đầy khoảng trống bằng rất nhiều giả thuyết. Nhưng một kết nối khiến bạn an toàn thường không bắt bạn phải đoán quá lâu. Bạn có thể nhìn xem họ có quay lại bằng một lời giải thích rõ ràng và hành động ổn định hơn không."
  },
  {
    keywords: ["nóng lạnh", "lúc gần lúc xa", "mập mờ", "không rõ", "khó hiểu"],
    reply:
      "Một người lúc gần lúc xa có thể khiến bạn mắc kẹt trong vòng lặp chờ tín hiệu tiếp theo. Thử hỏi bản thân: sau khi ở cạnh họ, bạn thấy bình yên hơn hay phải tiếp tục tự chứng minh rằng mình được chọn?"
  },
  {
    keywords: ["kiểm tra", "theo dõi", "stalk", "dấu hiệu", "ám ảnh"],
    reply:
      "Việc liên tục kiểm tra thường không làm mình chắc chắn hơn, chỉ làm câu hỏi kéo dài hơn. Nếu sau mỗi lần xem thêm bạn lại thấy mệt hơn, có lẽ điều cần chăm sóc trước không phải là câu trả lời của họ, mà là cảm giác an toàn của bạn."
  },
  {
    keywords: ["buồn", "mệt", "đau", "khóc", "tổn thương", "bất an"],
    reply:
      "Cảm giác mệt và bất an của bạn là dữ liệu quan trọng. Một mối quan hệ không cần hoàn hảo, nhưng nó nên có đủ sự rõ ràng để bạn không phải tự nghi ngờ giá trị của mình mỗi ngày."
  }
];

const conversation = {
  root: {
    options: [
      { label: "Không biết họ có yêu mình?", next: "uncertain" },
      { label: "Nóng lạnh thất thường", next: "mixed" },
      { label: "Không ngừng kiểm tra dấu hiệu", next: "checking" }
    ]
  },
  uncertain: {
    user: "Tôi không biết họ có yêu mình hay không.",
    reply: "Cảm giác không biết mình có được yêu hay không thật sự rất mệt. Một khoảnh khắc có thể đánh lừa mình, nhưng cách họ đối xử với bạn lặp đi lặp lại thì khó giả hơn. Điều nào dưới đây giống họ nhất?",
    options: [
      { label: "Họ chủ động và giữ lời", next: "consistent" },
      { label: "Chỉ xuất hiện khi họ cần", next: "convenient" },
      { label: "Tôi vẫn không nhìn ra", next: "unclear" }
    ]
  },
  mixed: {
    user: "Người đó lúc gần lúc xa, khi quan tâm khi im lặng.",
    reply: "Có lẽ điều làm bạn mệt không chỉ là sự im lặng, mà là việc cứ phải đoán xem lần này họ có quay lại không. Khi họ xuất hiện trở lại, họ thường làm gì?",
    options: [
      { label: "Họ giải thích rõ ràng", next: "explains" },
      { label: "Họ cư xử như chưa có gì", next: "ignores" },
      { label: "Tôi luôn là người hỏi trước", next: "chasing" }
    ]
  },
  checking: {
    user: "Tôi cứ kiểm tra mọi dấu hiệu của họ.",
    reply: "Mình hiểu vì sao bạn làm vậy: kiểm tra giúp bạn cảm thấy như mình vẫn còn nắm được điều gì đó. Nhưng sau mỗi lần kiểm tra, bạn thấy nhẹ lòng hơn hay lại có thêm một câu hỏi mới?",
    options: [
      { label: "Tôi chỉ càng mệt hơn", next: "exhausted" },
      { label: "Tôi sợ mình bỏ sót điều gì", next: "missing" },
      { label: "Tôi thấy yên tâm tạm thời", next: "temporary" }
    ]
  },
  consistent: {
    user: "Họ thường chủ động và giữ lời.",
    reply: "Vậy là giữa hai người đang có một nền tảng khá đáng tin. Bạn chưa cần vội đặt tên cho mối quan hệ; hãy để sự chủ động, giữ lời và tôn trọng của họ tiếp tục trả lời thay cho những lời hứa.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  convenient: {
    user: "Họ thường chỉ xuất hiện khi họ cần.",
    reply: "Nghe như bạn luôn phải ở đó khi họ cần, còn nhu cầu của bạn lại bị đặt sau cùng. Có lẽ câu hỏi quan trọng lúc này không chỉ là “họ có yêu mình không”, mà là “cách họ đối xử có đủ để mình cảm thấy được yêu không”.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  unclear: {
    user: "Tôi vẫn không nhìn ra pattern nào.",
    reply: "Không nhìn ra cũng không có nghĩa là bạn thiếu tinh tế. Đôi khi chính sự mơ hồ kéo dài đã là câu trả lời: một mối quan hệ an toàn thường không bắt bạn phải giải mã mọi thứ một mình.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  explains: {
    user: "Họ có giải thích rõ khi biến mất.",
    reply: "Việc họ giải thích cho thấy họ có để tâm đến cảm giác của bạn. Nhưng hãy nhìn thêm xem sau lời giải thích, họ có thay đổi cách cư xử để bạn bớt bất an không, vì lời nói chỉ thật sự có nghĩa khi đi cùng hành động.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  ignores: {
    user: "Họ quay lại như chưa từng có chuyện gì.",
    reply: "Việc họ bình thản quay lại không có nghĩa là khoảng thời gian bạn chờ đợi chưa từng tồn tại. Bạn hoàn toàn có quyền nói rằng sự im lặng ấy đã ảnh hưởng đến mình và xem họ có thật sự lắng nghe không.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  chasing: {
    user: "Tôi luôn là người phải hỏi trước.",
    reply: "Bạn đã cố gắng khá nhiều để giữ kết nối này rồi. Có lẽ bạn có thể lùi lại một chút, không phải để thử lòng, mà để xem mối quan hệ có thể tự đứng vững khi bạn không phải là người luôn kéo nó về phía mình hay không.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  exhausted: {
    user: "Việc kiểm tra chỉ khiến tôi mệt hơn.",
    reply: "Vậy có lẽ cơ thể bạn đang nói điều mà tâm trí chưa muốn thừa nhận: vòng lặp này không còn bảo vệ bạn nữa. Bạn có thể bắt đầu bằng một khoảng nghỉ nhỏ, không kiểm tra thêm, và để sự bình yên của mình được ưu tiên trước.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  missing: {
    user: "Tôi sợ mình sẽ bỏ sót một dấu hiệu quan trọng.",
    reply: "Nếu một tín hiệu thật sự quan trọng, nó sẽ không chỉ xuất hiện đúng một lần rồi bắt bạn phải săn tìm. Một người muốn ở bên bạn thường sẽ khiến điều đó đủ rõ bằng những hành động lặp lại.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  },
  temporary: {
    user: "Kiểm tra khiến tôi yên tâm, nhưng chỉ trong chốc lát.",
    reply: "Sự nhẹ nhõm ngắn ngủi đó dễ khiến mình quay lại kiểm tra thêm lần nữa, rồi lại thêm lần nữa. Thử đặt một giới hạn thật nhỏ hôm nay và quan sát cảm xúc của bạn, thay vì tiếp tục tìm câu trả lời trên màn hình.",
    options: [{ label: "Đọc một tín hiệu khác", next: "root" }]
  }
};

function addMessage(text, type) {
  const node = document.createElement("div");
  node.className = `message ${type}`;
  node.textContent = text;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderOptions(options) {
  quickReplies.replaceChildren();

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => selectChoice(option.next));
    quickReplies.appendChild(button);
  });
}

function getFallbackReply(message) {
  const normalized = message.toLowerCase();
  const matched = fallbackReplies.find((item) =>
    item.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched) return matched.reply;

  return "Mình nghe thấy trong câu hỏi của bạn có một sự phân vân chưa được gọi tên. Thử tách tình huống thành ba phần: họ đã làm gì, việc đó lặp lại bao nhiêu lần, và sau mỗi lần như vậy bạn cảm thấy an toàn hơn hay bất an hơn. Từ pattern đó, câu trả lời thường rõ hơn một lời đoán.";
}

async function getGeminiReply(message) {
  if (!geminiKey || geminiKey.includes("PASTE_")) {
    throw new Error("Missing AI key");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "Bạn là Disstopkl, một chatbot thấu cảm trong portfolio DISSTOPIA. Trả lời bằng tiếng Việt, 3-5 câu, dịu nhưng rõ. Không chẩn đoán, không khẳng định người kia yêu hay không yêu. Không nhắc API, Gemini, quota, model, lỗi hệ thống hay cấu hình kỹ thuật."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 220
      }
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join(" ").trim();

  if (!text) {
    throw new Error("Empty AI reply");
  }

  return text;
}

async function handleFreeformMessage(message) {
  addMessage(message, "viewer");
  quickReplies.replaceChildren();

  const typing = document.createElement("div");
  typing.className = "message system typing-message";
  typing.textContent = "Disstopkl đang lắng nghe...";
  chatLog.appendChild(typing);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const reply = await getGeminiReply(message);
    typing.remove();
    addMessage(reply, "system");
  } catch {
    await new Promise((resolve) => window.setTimeout(resolve, 360));
    typing.remove();
    addMessage(getFallbackReply(message), "system");
  } finally {
    renderOptions(conversation.root.options);
  }
}

function selectChoice(key) {
  if (key === "root") {
    chatLog.replaceChildren();
    addMessage("Bạn muốn Disstopkl cùng đọc tín hiệu nào?", "system");
    renderOptions(conversation.root.options);
    return;
  }

  const step = conversation[key];
  if (!step) return;

  addMessage(step.user, "viewer");
  quickReplies.replaceChildren();

  const typing = document.createElement("div");
  typing.className = "message system typing-message";
  typing.textContent = "Disstopkl đang lắng nghe...";
  chatLog.appendChild(typing);
  chatLog.scrollTop = chatLog.scrollHeight;

  window.setTimeout(() => {
    typing.remove();
    addMessage(step.reply, "system");
    renderOptions(step.options);
  }, 520);
}

renderOptions(conversation.root.options);

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = "";
    handleFreeformMessage(message);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && video.muted && video.autoplay) {
        video.play().catch(() => {});
      } else if (!entry.isIntersecting) {
        video.pause();
      }
    });
  },
  { threshold: 0.55 }
);

mediaVideos.forEach((video) => observer.observe(video));

function updateOrbitTrack() {
  orbitTrackNumber.textContent = String(orbitTrackIndex + 1).padStart(2, "0");
  orbitTrackTitle.textContent = orbitTracks[orbitTrackIndex];

  orbitCards.forEach((card, index) => {
    card.classList.toggle("is-active", index === orbitTrackIndex);
  });
}

if (orbitNext && orbitTrackNumber && orbitTrackTitle && orbitCards.length) {
  orbitNext.addEventListener("click", () => {
    orbitTrackIndex = (orbitTrackIndex + 1) % orbitTracks.length;
    updateOrbitTrack();
  });
}
