-- 创建增加投票数的函数
CREATE OR REPLACE FUNCTION increment_vote_count(submission_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE submissions
  SET vote_count = vote_count + 1
  WHERE id = submission_id_param;
END;
$$;
