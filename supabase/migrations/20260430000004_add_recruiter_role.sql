-- Update the role check constraint to include 'RECRUITER'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('OWNER', 'ADMIN', 'HR', 'BILLING', 'PAYROLL', 'AGENT', 'RECRUITER'));
