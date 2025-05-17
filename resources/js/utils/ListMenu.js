import {
  IconBuildingSkyscraper,
  IconFileDollar,
  IconGauge,
  IconLayoutList,
  IconListDetails,
  IconReorder,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
  IconAddressBook,
} from "@tabler/icons-react";

export const getMenuItems = () => [
  {
    label: "Dashboard",
    icon: IconGauge,
    link: route("dashboard"),
    active: route().current("dashboard"),
    visible: true,
    type: 'Page'
  },
  {
    label: "Projects",
    icon: IconListDetails,
    link: route("projects.index"),
    active: route().current("projects.*"),
    visible: can("view projects"),
    type: 'Page'
  },
  {
    label: "Inventories",
    icon: IconReorder,
    link: route("inventories.index"),
    active: route().current("inventories.*"),
    visible: can("view inventories"),
    type: 'Page'
  },
  {
    label: "My Work",
    icon: IconLayoutList,
    active: route().current("my-work.*"),
    opened: route().current("my-work.*"),
    visible: can("view tasks") || can("view activities"),
    type: 'Menu',
    links: [
      {
        label: "Tasks",
        link: route("my-work.tasks.index"),
        active: route().current("my-work.tasks.*"),
        visible: can("view tasks"),
        type: 'Submenu'
      },
      {
        label: "Activity",
        link: route("my-work.activity.index"),
        active: route().current("my-work.activity.*"),
        visible: can("view activities"),
        type: 'Submenu'
      },
    ],
  },
  {
   label: "Clients",
   icon: IconBuildingSkyscraper,
   active: route().current("clients.*"),
   opened: route().current("clients.*"),
   visible: can("view client users") || can("view client companies"),
   links: [
     {
       label: "Users",
       link: route("clients.users.index"),
       active: route().current("clients.users.*"),
       visible: can("view client users"),
     },
     {
       label: "Companies",
       link: route("clients.companies.index"),
       active: route().current("clients.companies.*"),
       visible: can("view client companies"),
     },
   ],
 },
  {
    label: "Users",
    icon: IconUsers,
    link: route("users.index"),
    active: route().current("users.*"),
    visible: can("view users"),
  },
  {
    label: "Invoices",
    icon: IconFileDollar,
    link: route("invoices.index"),
    active: route().current("invoices.*"),
    visible: can("view invoices"),
  },
  {
    label: "Reports",
    icon: IconReportAnalytics,
    active: route().current("reports.*"),
    opened: route().current("reports.*"),
    visible: can("view logged time sum report") || can("view daily logged time report"),
    links: [
      {
        label: "Logged time sum",
        link: route("reports.logged-time.sum"),
        active: route().current("reports.logged-time.sum"),
        visible: can("view logged time sum report"),
      },
      {
        label: "Daily logged time",
        link: route("reports.logged-time.daily"),
        active: route().current("reports.logged-time.daily"),
        visible: can("view daily logged time report"),
      },
      {
        label: "Report Project by analisis EVM",
        link: route(""),
        active: route().current(""),
        visible: can(""),
      },
      {
        label: "Inventory Reports",
        icon: IconAddressBook,
        link: route(""),
        active: route().current(""),
        visible: can(""),
      },
    ],
  },
  {
    label: "Settings",
    icon: IconSettings,
    active: route().current("settings.*"),
    opened: route().current("settings.*"),
    visible: can("view owner company") || can("view roles") || can("view labels"),
    links: [
      {
        label: "My Companies",
        link: route("settings.company.edit"),
        active: route().current("settings.company.*"),
        visible: can("view owner company"),
      },
      {
        label: "Roles",
        link: route("settings.roles.index"),
        active: route().current("settings.roles.*"),
        visible: can("view roles"),
      },
      {
        label: "Status",
        link: route("settings.labels.index"),
        active: route().current("settings.labels.*"),
        visible: can("view labels"),
      }
    ]},
];
