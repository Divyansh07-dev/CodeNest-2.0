import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Send } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {
    const text = data.message?.trim();
    if (!text) return;

    const userMessage = {
      role: "user",
      parts: [{ text }],
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    reset();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/ai/chat",
        {
          messages: updatedMessages,
          title: problem?.title,
          description: problem?.description,
          testCases: problem?.visibleTestCases,
          startCode: problem?.startCode,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const aiText =
        response.data?.response ||
        response.data?.message ||
        "No response from AI";

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: aiText }],
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error.response?.data || error.message);

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            {
              text:
                error.response?.data?.details ||
                error.response?.data?.error ||
                "Sorry, something went wrong. Please try again.",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] min-h-[500px] bg-base-100 rounded-xl shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-base-content/60 py-10">
            Ask anything about "{problem?.title}" – hints, debugging,
            approaches...
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.role === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.role === "user"
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content"
              } max-w-[85%] whitespace-pre-wrap break-words`}
            >
              {msg.parts?.[0]?.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-200">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 bg-base-200 border-t border-base-300"
      >
        <div className="flex items-center gap-2">
          <input
            placeholder="Ask about hints, bugs, complexity, approaches..."
            className="input input-bordered flex-1 focus:outline-none"
            {...register("message", {
              required: true,
              minLength: 2,
            })}
            disabled={isLoading}
            autoFocus
          />

          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>

        {errors.message && (
          <p className="text-error text-sm mt-1">
            Please type a message.
          </p>
        )}
      </form>
    </div>
  );
}

export default ChatAi;