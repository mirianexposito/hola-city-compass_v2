-- Live database assertions. A violated rule raises division by zero.
SELECT
  1 / CASE WHEN (
    SELECT count(*) = 10 AND bool_and(is_fictional)
    FROM public.demo_profiles WHERE sample_key IN (
      'demo-01', 'demo-02', 'demo-03', 'demo-04', 'demo-05',
      'demo-06', 'demo-07', 'demo-08', 'demo-09', 'demo-10'
    )
  ) THEN 1 ELSE 0 END AS ten_fictional_examples,
  1 / CASE WHEN (
    SELECT bool_and(
      origin <> '' AND arrival <> '' AND neighborhood <> ''
      AND cardinality(interests) > 0 AND cardinality(goals) > 0
      AND cardinality(desired_activities) > 0 AND budget <> ''
      AND company <> '' AND cardinality(availability) > 0
    ) FROM public.demo_profiles
  ) THEN 1 ELSE 0 END AS all_questionnaire_fields_present,
  1 / CASE WHEN (
    has_table_privilege('anon', 'public.demo_profiles', 'SELECT')
    AND has_table_privilege('anon', 'public.demo_profiles', 'INSERT')
    AND has_table_privilege('anon', 'public.demo_profiles', 'UPDATE')
    AND has_table_privilege('anon', 'public.demo_profiles', 'DELETE')
    AND NOT has_table_privilege('anon', 'public.profiles', 'SELECT')
    AND (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.demo_profiles'::regclass)
    AND (SELECT count(*) = 4 AND bool_and(
      coalesce(qual, with_check) = '(is_fictional = true)'
      AND (with_check IS NULL OR with_check = '(is_fictional = true)')
    ) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'demo_profiles')
  ) THEN 1 ELSE 0 END AS fictional_crud_only_private_profiles_locked,
  1 / CASE WHEN (
    NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.demo_profiles'::regclass AND contype = 'f'
    )
  ) THEN 1 ELSE 0 END AS no_real_account_references;