-- =========================================================================
-- GoTall Admin Studio: Storage Usage RPC
-- SECURITY DEFINER: Accesses database size and storage objects securely
-- =========================================================================

CREATE OR REPLACE FUNCTION admin_storage_usage()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, pg_catalog
AS $$
DECLARE
  v_users_count bigint := 0;
  v_db_size_bytes bigint := 0;
  v_file_count bigint := 0;
  v_files_total_bytes bigint := 0;
BEGIN
  -- 1. Get user count from profiles (or auth.users fallback)
  BEGIN
    SELECT count(*) INTO v_users_count FROM public.profiles;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT count(*) INTO v_users_count FROM auth.users;
    EXCEPTION WHEN OTHERS THEN
      v_users_count := 0;
    END;
  END;

  -- 2. Get current PostgreSQL database size in bytes
  BEGIN
    SELECT pg_database_size(current_database()) INTO v_db_size_bytes;
  EXCEPTION WHEN OTHERS THEN
    v_db_size_bytes := 0;
  END;

  -- 3. File count and total size in storage bucket 'exercise-media'
  BEGIN
    SELECT
      coalesce(count(*), 0),
      coalesce(sum((metadata->>'size')::bigint), 0)
    INTO v_file_count, v_files_total_bytes
    FROM storage.objects
    WHERE bucket_id = 'exercise-media';
  EXCEPTION WHEN OTHERS THEN
    v_file_count := 0;
    v_files_total_bytes := 0;
  END;

  RETURN json_build_object(
    'users_count', v_users_count,
    'db_size_bytes', v_db_size_bytes,
    'media_file_count', v_file_count,
    'media_total_bytes', v_files_total_bytes
  );
END;
$$;

-- Revoke execute permissions from public, anon, and authenticated
REVOKE EXECUTE ON FUNCTION admin_storage_usage() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_storage_usage() FROM anon;
REVOKE EXECUTE ON FUNCTION admin_storage_usage() FROM authenticated;

-- Allow service_role only (server-side Next.js route using SUPABASE_SERVICE_ROLE_KEY)
GRANT EXECUTE ON FUNCTION admin_storage_usage() TO service_role;
