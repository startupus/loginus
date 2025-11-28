INSERT INTO user_role_assignments ("userId", "roleId", "organizationId", "teamId", "assignedBy", "createdAt", "updatedAt")
SELECT 
  u.id,
  r.id,
  null,
  null,
  u.id,
  NOW(),
  NOW()
FROM users u, roles r 
WHERE u.email = 'saschkaproshka04@mail.ru' 
AND r.name = 'super_admin'
AND NOT EXISTS (
  SELECT 1 FROM user_role_assignments ura 
  WHERE ura."userId" = u.id 
  AND ura."roleId" = r.id
);

