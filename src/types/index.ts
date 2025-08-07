export interface HealthCheckResult {
  id: string;
  service_name: string;
  service_url: string;
  status: 'ok' | 'error' | 'timeout';
  response_time?: number;
  response_body?: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  name: string;
  url: string;
  expected_response: string;
  is_active: boolean;
  check_interval: number;
  timeout: number;
  created_at: Date;
  updated_at: Date;
}

export interface RecentHealthStatus {
  service_name: string;
  service_url: string;
  current_status: 'ok' | 'error' | 'timeout' | null;
  response_time: number | null;
  last_check: Date | null;
  response_body: string | null;
  error_message: string | null;
}

export interface ServiceUptime {
  service_name: string;
  total_checks: number;
  successful_checks: number;
  uptime_percentage: number;
  avg_response_time: number | null;
  first_check: Date | null;
  last_check: Date | null;
}

export interface HealthCheckRequest {
  service_name: string;
  url: string;
  expected_response: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
  retries: number;
} 