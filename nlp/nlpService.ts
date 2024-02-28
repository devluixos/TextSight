import * as webllm from "@mlc-ai/web-llm";

const chat = new webllm.ChatModule();

export async function generateResponse(prompt: string): Promise<string> {
  const myAppConfig: webllm.AppConfig = {
    model_list: [
      {
        "model_url": "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1-MLC/resolve/main/",
        "local_id": "Llama-2-7b-chat-hf-q4f32_1",
        "model_lib_url": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-2-7b-chat-hf/Llama-2-7b-chat-hf-q4f32_1-ctx4k_cs1k-webgpu.wasm",
      },
    ]
  }

  const selectedModel = "Llama-2-7b-chat-hf-q4f32_1"
  await chat.reload(selectedModel, undefined, myAppConfig);

  const reply = await chat.generate(prompt);
  return reply;
}