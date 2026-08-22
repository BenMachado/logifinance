export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CompanyRegisterRead {
  user: UserRead;
  company_id: number;
  company_name: string;
}

export interface Company {
  id: number;
  name: string;
  cnpj?: string | null;
  phone?: string | null;
  expected_margin: number;
  created_at: string;
}

export interface CompanyUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserRead {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  company_id: number;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Driver {
  id: number;
  company_id: number;
  full_name: string;
  phone: string;
  license_number?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Vehicle {
  id: number;
  company_id: number;
  plate: string;
  model: string;
  year?: number | null;
  driver_id?: number | null;
  status: "active" | "maintenance" | "inactive";
  created_at: string;
}

export interface Trip {
  id: number;
  company_id: number;
  vehicle_id: number;
  driver_id?: number | null;
  origin: string;
  destination: string;
  cargo_description?: string | null;
  gross_revenue: number;
  distance_km?: number | null;
  scheduled_date: string;
  completed_at?: string | null;
  status: "in_progress" | "completed" | "cancelled";
  notes?: string | null;
  created_at: string;
}

export interface CostEntry {
  id: number;
  company_id: number;
  vehicle_id: number;
  trip_id?: number | null;
  receipt_id?: number | null;
  category: "fuel" | "toll" | "maintenance" | "food" | "insurance" | "tax" | "other";
  source: "whatsapp_ocr" | "manual" | "upload" | "system";
  amount: number;
  description?: string | null;
  incurred_on: string;
  created_at: string;
}

export interface Receipt {
  id: number;
  company_id: number;
  vehicle_id?: number | null;
  driver_id?: number | null;
  sender_name: string;
  sender_phone?: string | null;
  image_path: string;
  original_filename: string;
  ocr_text?: string | null;
  extracted_amount?: number | null;
  extracted_plate?: string | null;
  suggested_category: string;
  status: "pending" | "confirmed" | "rejected";
  received_at: string;
  reviewed_at?: string | null;
}

export type MaintenanceType = "preventive" | "corrective" | "inspection";

export type CostCategory = "fuel" | "toll" | "maintenance" | "food" | "insurance" | "tax" | "other";

export interface Maintenance {
  id: number;
  company_id: number;
  vehicle_id: number;
  type: "preventive" | "corrective" | "inspection";
  description: string;
  cost: number;
  performed_on: string;
  next_due?: string | null;
  cost_entry_id?: number | null;
  created_at: string;
}

export interface CostAlert {
  id: number;
  company_id: number;
  vehicle_id: number;
  trip_id?: number | null;
  severity: "warning" | "critical";
  title: string;
  message: string;
  actual_margin: number;
  expected_margin: number;
  is_resolved: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  gross_revenue: number;
  total_cost: number;
  net_profit: number;
  avg_margin: number;
  fleet_size: number;
  active_trips: number;
  period_label: string;
}

export interface VehiclePerformanceRow {
  vehicle_id: number;
  plate: string;
  model: string;
  route: string;
  gross_revenue: number;
  total_cost: number;
  net_profit: number;
  margin_pct: number;
  status: "profit" | "alert" | "neutral";
}

export interface VehiclePerformance {
  rows: VehiclePerformanceRow[];
}

export interface WhatsAppReceiptEntry {
  id: number;
  sender_name: string;
  received_at: string;
  original_filename: string;
  image_path: string;
  extracted_amount?: number | null;
  extracted_plate?: string | null;
  vehicle_id?: number | null;
  status: string;
}

export interface CostBreakdownItem {
  category: string;
  total: number;
}

export interface MonthlyProfitItem {
  month: string;
  month_label: string;
  year: number;
  gross_revenue: number;
  total_cost: number;
  net_profit: number;
  margin_pct: number;
}

export interface MonthlyProfitResponse {
  items: MonthlyProfitItem[];
  current_month_profit: number;
  previous_month_profit: number;
  delta_percent?: number | null;
}

