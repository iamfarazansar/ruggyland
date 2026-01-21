/**
 * API Client for Medusa Backend
 * Handles authentication and API calls for the Management App
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  token?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ token: string }>(
      "/auth/user/emailpass",
      {
        method: "POST",
        body: { email, password },
      },
    );
    this.setToken(response.token);
    return response;
  }

  // Work Orders
  async getWorkOrders(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/work-orders?${params}`);
  }

  async getWorkOrder(id: string) {
    return this.request(`/admin/work-orders/${id}`);
  }

  async createWorkOrdersFromOrder(orderId: string, priority?: string) {
    return this.request(`/admin/work-orders/from-order/${orderId}`, {
      method: "POST",
      body: { priority },
    });
  }

  async updateWorkOrder(id: string, data: Record<string, unknown>) {
    return this.request(`/admin/work-orders/${id}`, {
      method: "PATCH",
      body: data,
    });
  }

  async advanceWorkOrderStage(
    id: string,
    notes?: string,
    assigned_to?: string,
  ) {
    return this.request(`/admin/work-orders/${id}/stages`, {
      method: "POST",
      body: { notes, assigned_to },
    });
  }

  async assignWorkOrder(id: string, artisanId: string) {
    return this.request(`/admin/work-orders/${id}/assign`, {
      method: "POST",
      body: { artisan_id: artisanId },
    });
  }

  async addWorkOrderMedia(
    id: string,
    url: string,
    caption?: string,
    stageId?: string,
  ) {
    return this.request(`/admin/work-orders/${id}/media`, {
      method: "POST",
      body: { url, caption, stage_id: stageId },
    });
  }

  // Artisans
  async getArtisans(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/artisans?${params}`);
  }

  async createArtisan(data: {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }) {
    return this.request("/admin/artisans", {
      method: "POST",
      body: data,
    });
  }

  // Orders (from Medusa)
  async getOrders(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request(`/admin/orders?${params}`);
  }

  async getOrder(id: string) {
    return this.request(`/admin/orders/${id}`);
  }
}

export const api = new ApiClient(BACKEND_URL);
export default api;
