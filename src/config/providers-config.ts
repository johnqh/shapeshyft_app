/**
 * Provider configuration - single source of truth for LLM providers
 * Uses LLM_PROVIDERS from shapeshyft_types as the base list
 */
import { LLM_PROVIDERS, type LlmProvider } from "@sudobility/shapeshyft_types";

/** Display labels for each provider */
export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic (Claude)",
  gemini: "Google Gemini",
  mistral: "Mistral AI",
  cohere: "Cohere",
  groq: "Groq",
  xai: "xAI (Grok)",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
  llm_server: "Custom LM Server",
};

/** Provider options for form dropdowns */
export const PROVIDER_OPTIONS: { value: LlmProvider; label: string }[] =
  LLM_PROVIDERS.map((provider) => ({
    value: provider,
    label: PROVIDER_LABELS[provider],
  }));

/** Get display label for a provider */
export function getProviderLabel(provider: LlmProvider): string {
  return PROVIDER_LABELS[provider] ?? provider;
}
