/**
 * TiRouter Services Management API
 * Endpoints for managing TiRouter, OpenClaw, and TiBrain services
 */

import { apiClient } from './client';

// Service status types
export interface ServiceStatus {
  name: string;
  running: boolean;
  version?: string;
  started_at?: string;
  uptime?: string;
  pid?: number;
  endpoint?: string;
  health: 'healthy' | 'unhealthy' | 'unknown';
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  components: {
    router: { status: string; port: number };
    openclaw: { status: string; local: boolean };
    tibrain: { status: string; directory: string };
  };
}

export interface CliCommandResult {
  status: string;
  output: string;
  error?: string;
  request: {
    command: string;
    args: string[];
  };
}

export interface ServicesResponse {
  services: ServiceStatus[];
  timestamp: string;
}

export interface ServiceActionResponse {
  status: string;
  service: string;
  message?: string;
  error?: string;
}

// API client for service management endpoints
export const servicesApi = {
  /**
   * Get status of all managed services (TiRouter, OpenClaw, TiBrain)
   */
  async getServicesStatus(): Promise<ServicesResponse> {
    return await apiClient.get<ServicesResponse>('/services/status');
  },

  /**
   * Get detailed system health information
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return await apiClient.get<SystemHealth>('/system/health');
  },

  /**
   * Start a specific service
   * @param serviceName - 'tirouter' | 'openclaw' | 'tibrain'
   */
  async startService(serviceName: string): Promise<ServiceActionResponse> {
    return await apiClient.post<ServiceActionResponse>(
      `/services/${serviceName}/start`
    );
  },

  /**
   * Stop a specific service
   * @param serviceName - 'openclaw' | 'tibrain' (cannot stop TiRouter)
   */
  async stopService(serviceName: string): Promise<ServiceActionResponse> {
    return await apiClient.post<ServiceActionResponse>(
      `/services/${serviceName}/stop`
    );
  },

  /**
   * Run an OpenClaw CLI command
   * @param args - Array of command line arguments
   */
  async runOpenClawCommand(args: string[]): Promise<CliCommandResult> {
    return await apiClient.post<CliCommandResult>(
      '/services/openclaw/cli',
      { args }
    );
  },

  /**
   * Get current router status (convenience method)
   */
  async getRouterStatus(): Promise<ServiceStatus | null> {
    try {
      const response = await this.getServicesStatus();
      return response.services.find(s => s.name === 'TiRouter') || null;
    } catch {
      return null;
    }
  },

  /**
   * Get current OpenClaw status
   */
  async getOpenClawStatus(): Promise<ServiceStatus | null> {
    try {
      const response = await this.getServicesStatus();
      return response.services.find(s => s.name === 'OpenClaw') || null;
    } catch {
      return null;
    }
  },

  /**
   * Get current TiBrain status
   */
  async getTiBrainStatus(): Promise<ServiceStatus | null> {
    try {
      const response = await this.getServicesStatus();
      return response.services.find(s => s.name === 'TiBrain') || null;
    } catch {
      return null;
    }
  },
};
