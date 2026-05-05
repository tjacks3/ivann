-- Add "pending" to the deal_status enum
ALTER TYPE "deal_status" ADD VALUE IF NOT EXISTS 'pending' AFTER 'draft';
