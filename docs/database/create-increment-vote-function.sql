-- 创建增加投票计数的函数
CREATE OR REPLACE FUNCTION increment_vote_count(submission_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE submissions
  SET vote_count = vote_count + 1
  WHERE id = submission_id_param;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION increment_vote_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_vote_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_vote_count(UUID) TO service_role;
