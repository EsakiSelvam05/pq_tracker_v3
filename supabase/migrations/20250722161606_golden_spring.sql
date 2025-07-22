/*
  # Create PQ Records Table

  1. New Tables
    - `pq_records`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `date` (date)
      - `shipper_name` (text, not null)
      - `buyer` (text, not null)
      - `invoice_number` (text, not null, unique)
      - `commodity` (text, not null)
      - `shipping_bill_received` (boolean)
      - `pq_status` (text)
      - `pq_hardcopy` (text)
      - `permit_copy_status` (text)
      - `destination_port` (text)
      - `remarks` (text)
      - `files` (jsonb)

  2. Security
    - Enable RLS on `pq_records` table
    - Add policies for authenticated users to manage their data

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the pq_records table
CREATE TABLE IF NOT EXISTS public.pq_records (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    date date NULL,
    shipper_name text NOT NULL,
    buyer text NOT NULL,
    invoice_number text NOT NULL,
    commodity text NOT NULL,
    shipping_bill_received boolean NULL,
    pq_status text NULL,
    pq_hardcopy text NULL,
    permit_copy_status text NULL,
    destination_port text NULL,
    remarks text NULL,
    files jsonb NULL,
    CONSTRAINT pq_records_pkey PRIMARY KEY (id),
    CONSTRAINT pq_records_invoice_number_key UNIQUE (invoice_number)
);

-- Enable Row Level Security
ALTER TABLE public.pq_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all pq_records"
    ON public.pq_records
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert pq_records"
    ON public.pq_records
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update pq_records"
    ON public.pq_records
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can delete pq_records"
    ON public.pq_records
    FOR DELETE
    TO authenticated
    USING (true);

-- Create the trigger for updating updated_at
DROP TRIGGER IF EXISTS update_pq_records_updated_at ON public.pq_records;
CREATE TRIGGER update_pq_records_updated_at
    BEFORE UPDATE ON public.pq_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();