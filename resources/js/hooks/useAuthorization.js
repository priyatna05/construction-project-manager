import { usePage } from '@inertiajs/react';

export default function useAuthorization() {
  const { auth } = usePage().props;

  const isAdmin = () => {
    return auth.user.roles.includes('admin');
  };

  const can = permission => {
    if (isAdmin()) {
      return true;
    }
    return auth.user.permissions.includes(permission);
  };

  return { can, isAdmin };
}
