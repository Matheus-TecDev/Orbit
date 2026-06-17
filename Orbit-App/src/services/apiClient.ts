import { API_URL } from "../constants/env";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export class ApiRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = error.status;
    this.details = error.details;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", body, token, headers } = options;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders({ body, token, headers }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (shouldHandleUnauthorized(response.status, token)) {
      await unauthorizedHandler?.();
    }

    throw new ApiRequestError({
      status: response.status,
      message: getErrorMessage(data, response.status),
      details: data,
    });
  }

  return data as TResponse;
}

function shouldHandleUnauthorized(status: number, token?: string | null) {
  return Boolean(token) && (status === 401 || status === 403);
}

type BuildHeadersInput = {
  body: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

function buildHeaders({ body, token, headers }: BuildHeadersInput) {
  const nextHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    nextHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  return nextHeaders;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}

function getErrorMessage(data: unknown, status: number) {
  const detail = readDetail(data);

  if (detail) {
    return detail;
  }

  if (status === 401) {
    return "E-mail ou senha inválidos.";
  }

  if (status === 409) {
    return "Já existe uma conta com estes dados.";
  }

  if (status === 422) {
    return "Confira os dados informados e tente novamente.";
  }

  return "Não foi possível concluir a solicitação. Tente novamente.";
}

function readDetail(data: unknown): string | null {
  if (!isRecord(data) || !("detail" in data)) {
    return null;
  }

  const detail = data.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (isRecord(item) && typeof item.msg === "string") {
          return item.msg;
        }

        return null;
      })
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(" ") : null;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
