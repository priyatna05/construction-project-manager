import {
  IconBuildingSkyscraper,
  IconGauge,
  IconLayoutList,
  IconListDetails,
  IconReorder,
  IconSettings,
  IconUsers,
  IconReportAnalytics,
} from '@tabler/icons-react';

export const getMenuItems = () => {
  const isClient = window.auth?.user?.roles?.includes('client');
  const hasProjects = Boolean(window.auth?.user?.has_projects);

  return [
    {
      label: 'Dashboard',
      icon: IconGauge,
      link: route('dashboard'),
      active: route().current('dashboard'),
      visible: true,
      type: 'Page',
    },
    {
      label: 'Projects',
      icon: IconListDetails,
      link: route('projects.index'),
      active: route().current('projects.*'),
      visible: isClient ? hasProjects : can('view projects'),
      type: 'Page',
    },
    {
      label: 'Inventories',
      icon: IconReorder,
      link: route('inventories.index'),
      active: route().current('inventories.*'),
      visible: can('view inventory'),
      type: 'Page',
    },
    {
      label: 'My Work',
      icon: IconLayoutList,
      link: route('my-work.index'),
      active: route().current('my-work.*'),
      opened: route().current('my-work.*'),
      visible:
        (can('view tasks') || can('view activities')) &&
        !window.auth?.user?.roles?.includes('client'),
      type: 'Menu',
      links: [
        {
          label: 'Tasks',
          link: route('my-work.tasks.index'),
          active: route().current('my-work.tasks.*'),
          visible: can('view tasks'),
          type: 'Submenu',
        },
        {
          label: 'Activity',
          link: route('my-work.activity.index'),
          active: route().current('my-work.activity.*'),
          visible: can('view activities'),
          type: 'Submenu',
        },
      ],
    },
    {
      label: 'Clients',
      icon: IconBuildingSkyscraper,
      link: route('clients.index'),
      active: route().current('clients.*'),
      opened: route().current('clients.*'),
      visible: can('view client users') || can('view client companies'),
      links: [
        {
          label: 'Users',
          link: route('clients.users.index'),
          active: route().current('clients.users.*'),
          visible: can('view client users'),
        },
        {
          label: 'Companies',
          link: route('clients.companies.index'),
          active: route().current('clients.companies.*'),
          visible: can('view client companies'),
        },
      ],
    },
    {
      label: 'Team',
      icon: IconUsers,
      link: route('users.index'),
      active: route().current('users.*'),
      visible: can('view users'),
      type: 'Page',
    },
    // UPCOMING FEATURE!
    // {
    //   label: 'Invoices',
    //   icon: IconFileDollar,
    //   link: route('invoices.index'),
    //   active: route().current('invoices.*'),
    //   visible: can('view invoices'),
    // },
    {
      label: 'Reports',
      icon: IconReportAnalytics,
      link: route('reports.index'),
      active: route().current('reports.*'),
      visible: can('view reports') || can('export reports'),
      type: 'Page',
    },
    {
      label: 'Settings',
      icon: IconSettings,
      link: route('settings.index'),
      active: route().current('settings.*'),
      opened: route().current('settings.*'),
      visible: can('view owner company') || can('view roles') || can('view labels'),
      type: 'Menu',
      links: [
        {
          label: 'My Companies',
          link: route('settings.company.edit'),
          active: route().current('settings.company.*'),
          visible: can('view owner company'),
          type: 'Submenu',
        },
        {
          label: 'Roles',
          link: route('settings.roles.index'),
          active: route().current('settings.roles.*'),
          visible: can('view roles'),
          type: 'Submenu',
        },
        {
          label: 'Status',
          link: route('settings.labels.index'),
          active: route().current('settings.labels.*'),
          visible: can('view labels'),
          type: 'Submenu',
        },
      ],
    },
  ];
};
