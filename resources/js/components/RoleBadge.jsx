import useRoles from '@/hooks/useRoles';
import { Badge } from '@mantine/core';

export default function RoleBadge({ role }) {
  const { getColor } = useRoles();

  return (
    <Badge
      color={getColor(role)}
      variant='light'
      style={{
        whiteSpace: 'normal',
        overflow: 'visible',
        textOverflow: 'initial',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {role}
    </Badge>
  );
}
