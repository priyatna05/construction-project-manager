import useNavigationStore from '@/hooks/store/useNavigationStore';
import { getMenuItems } from '@/utils/ListMenu';
import { useEffect } from 'react';
import NavbarLinksGroup from './NavbarLinksGroup';
import classes from './css/NavBarNested.module.css';

export default function NavBarNested({ collapsed, currentPath }) {
  const { items, setItems } = useNavigationStore();

  useEffect(() => {
    setItems(getMenuItems());
  }, []);

  return (
    <nav
      className={classes.navbar}
      data-tour='sidebar'
    >
      <div className={classes.linksInner}>
        {items
          .filter(i => i.visible)
          .map(item => (
            <NavbarLinksGroup
              key={item.label}
              item={item}
              collapsed={collapsed}
              currentPath={currentPath}
            />
          ))}
      </div>
    </nav>
  );
}
