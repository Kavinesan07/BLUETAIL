export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Turns "/uploads/car.jpg" (from the backend) into a full URL
export function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

async function request(path, { method = "GET", body } = {}) {
  const isForm = body instanceof FormData; // true when uploading an image

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      // For image upload the browser sets the header itself, so we skip it
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the API is running.", 0);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // FastAPI: {detail: "text"} for HTTPException, {detail: [...]} for 422 validation
    const message = Array.isArray(data.detail)
      ? "Please check the fields and try again."
      : data.detail || "Something went wrong. Try again.";
    throw new ApiError(message, res.status);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
};
