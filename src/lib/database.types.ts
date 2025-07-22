export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pq_records: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          date: string | null
          shipper_name: string
          buyer: string
          invoice_number: string
          commodity: string
          shipping_bill_received: boolean | null
          pq_status: string | null
          pq_hardcopy: string | null
          permit_copy_status: string | null
          destination_port: string | null
          remarks: string | null
          files: Json | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          date?: string | null
          shipper_name: string
          buyer: string
          invoice_number: string
          commodity: string
          shipping_bill_received?: boolean | null
          pq_status?: string | null
          pq_hardcopy?: string | null
          permit_copy_status?: string | null
          destination_port?: string | null
          remarks?: string | null
          files?: Json | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          date?: string | null
          shipper_name?: string
          buyer?: string
          invoice_number?: string
          commodity?: string
          shipping_bill_received?: boolean | null
          pq_status?: string | null
          pq_hardcopy?: string | null
          permit_copy_status?: string | null
          destination_port?: string | null
          remarks?: string | null
          files?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}