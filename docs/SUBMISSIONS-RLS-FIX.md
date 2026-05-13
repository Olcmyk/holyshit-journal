# Submissions Table RLS Fix

## Problem
Users cannot submit papers because the `submissions` table has RLS enabled but no INSERT policy for public users.

**Error**: `new row violates row-level security policy for table "submissions"`

## Root Cause
The database schema enables RLS on the submissions table but only defines policies for:
- Public READ access (approved submissions only)
- Service role full access

There's no policy allowing anonymous users to INSERT new submissions.

## Solution

### Step 1: Execute SQL Fix
Run this SQL in your Supabase SQL Editor:

```sql
-- Add policy to allow anyone to insert submissions
CREATE POLICY "Public can submit papers" ON submissions
  FOR INSERT
  TO public
  WITH CHECK (true);
```

### Step 2: Verify
Check that the policy was created:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'submissions';
```

You should see:
- "Public can read approved submissions" (SELECT)
- "Public can submit papers" (INSERT)
- "Service role can do everything on submissions" (ALL)

### Step 3: Test
1. Restart your Next.js dev server (if needed)
2. Try uploading a paper through the UI
3. The submission should now succeed

## Files
- SQL script: `docs/database/supabase-submissions-rls.sql`
- Related: `docs/STORAGE-FIX.md` (Storage bucket permissions)

## Security Notes
This policy allows anyone to submit papers, which is the intended behavior. The papers are:
- Not publicly visible until approved (status = 'approved')
- Subject to validation (PDF hash, file size, page count)
- Protected by rate limiting and fingerprinting in the application layer
