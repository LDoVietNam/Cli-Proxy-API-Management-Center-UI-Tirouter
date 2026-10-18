/**
 * Routing Extended Management API
 * Endpoints for health-check, circuit-breaker, fallback, chains, priority-failover
 */

import { apiClient } from './client';
import type {
  HealthCheckConfig,
  CircuitBreakerConfig,
  FallbackRoutingConfig,
  PriorityChain,
  PriorityFailoverConfig,
} from '@/types/visualConfig';

export const routingExtendedApi = {
  // Health Check
  async getHealthCheck(): Promise<HealthCheckConfig> {
    return await apiClient.get<HealthCheckConfig>('/routing/health-check');
  },

  async putHealthCheck(config: HealthCheckConfig): Promise<void> {
    await apiClient.put('/routing/health-check', config);
  },

  async patchHealthCheck(config: Partial<HealthCheckConfig>): Promise<void> {
    await apiClient.patch('/routing/health-check', config);
  },

  // Circuit Breaker
  async getCircuitBreaker(): Promise<CircuitBreakerConfig> {
    return await apiClient.get<CircuitBreakerConfig>('/routing/circuit-breaker');
  },

  async putCircuitBreaker(config: CircuitBreakerConfig): Promise<void> {
    await apiClient.put('/routing/circuit-breaker', config);
  },

  async patchCircuitBreaker(config: Partial<CircuitBreakerConfig>): Promise<void> {
    await apiClient.patch('/routing/circuit-breaker', config);
  },

  // Fallback Routing
  async getFallbackRouting(): Promise<FallbackRoutingConfig> {
    return await apiClient.get<FallbackRoutingConfig>('/routing/fallback');
  },

  async putFallbackRouting(config: FallbackRoutingConfig): Promise<void> {
    await apiClient.put('/routing/fallback', config);
  },

  async patchFallbackRouting(config: Partial<FallbackRoutingConfig>): Promise<void> {
    await apiClient.patch('/routing/fallback', config);
  },

  // Priority Chains
  async getPriorityChains(): Promise<Record<string, PriorityChain>> {
    return await apiClient.get<Record<string, PriorityChain>>('/routing/chains');
  },

  async putPriorityChains(chains: Record<string, PriorityChain>): Promise<void> {
    await apiClient.put('/routing/chains', chains);
  },

  async patchPriorityChains(chains: Partial<Record<string, PriorityChain>>): Promise<void> {
    await apiClient.patch('/routing/chains', chains);
  },

  // Priority Failover
  async getPriorityFailover(): Promise<PriorityFailoverConfig> {
    return await apiClient.get<PriorityFailoverConfig>('/routing/priority-failover');
  },

  async putPriorityFailover(config: PriorityFailoverConfig): Promise<void> {
    await apiClient.put('/routing/priority-failover', config);
  },

  async patchPriorityFailover(config: Partial<PriorityFailoverConfig>): Promise<void> {
    await apiClient.patch('/routing/priority-failover', config);
  },
};