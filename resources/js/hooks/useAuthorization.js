import { usePage } from '@inertiajs/react';

export default function useAuthorization() {
  const { auth } = usePage().props;

  const isAdmin = () => {
    return auth.user.roles.includes('admin');
  };

  const isManager = () => {
    return auth.user.roles.includes('manager');
  };

  const isTeamMember = () => {
    return auth.user.roles.includes('team member');
  }

  const can = permission => {
    if (isAdmin()) {
      return true;
    }
    return auth.user.permissions.includes(permission);
  };

  return { can, isAdmin, isManager, isTeamMember };
}
