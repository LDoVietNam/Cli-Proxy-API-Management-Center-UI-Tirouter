// Local types for ModelsPage — API service returns loosely-typed payloads,
// these narrow them at the page boundary without touching the shared API layer.

export interface AvailableModel {
  id?: string;
  name?: string;
  display_name?: string;
  description?: string;
  context_length?: number;
  max_completion_tokens?: number;
  owned_by?: string;
  type?: string;
  supported_parameters?: string[];
}

export interface ModelTestResult {
  ok: boolean;
  model: string;
  provider: string;
  latency: string;
  status_code?: number;
  response?: string;
  error?: string;
  tokens_used?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export interface ModelTestRequest {
  model: string;
  provider: string;
  auth_index?: string;
  message?: string;
  max_tokens?: number;
  temperature?: number;
  headers?: Record<string, string>;
}
