import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  {
    id: 2,
    label: 'MENUITEMS.DASHBOARD.TEXT',
    icon: 'ri-apps-2-line',
    link: ''
  },
  {
    id: 3,
    label: 'MENUITEMS.CONFIG.TEXT',
    icon: 'ri-settings-2-line',
    subItems: [
      {
        id: 12,
        label: 'MENUITEMS.CONFIG.LIST.COMPANIES',
        link: '/projects/config',
        parentId: 3
      },{
        id: 13,
        label: 'MENUITEMS.CONFIG.LIST.USERS',
        link: '/projects/users',
        parentId: 3
      }
    ]
  },
  {
    id: 4,
    label: 'MENUITEMS.DASHBOARD.LIST.PROJECTS',
    icon: 'ri-scales-line',
    link: '/projects'
  },
  {
    id: 5,
    label: 'MENUITEMS.COMMITMENTS.TEXT',
    icon: 'ri-auction-line',
    link: '/projects'
  },
  {
    id: 6,
    label: 'MENUITEMS.MONITORING.TEXT',
    icon: 'ri-zoom-in-line',
    link: '/projects'
  },
  {
    id: 7,
    label: 'MENUITEMS.AUDITS.TEXT',
    icon: 'ri-clipboard-line',
    link: '/projects'
  },
  {
    id: 8,
    label: 'MENUITEMS.LIBRARY.TEXT',
    icon: 'ri-zoom-in-line',
    link: '/projects'
  },
  {
    id: 9,
    label: 'MENUITEMS.PYS.TEXT',
    icon: 'ri-stack-line',
    subItems: [
      {
        id: 10,
        label: 'MENUITEMS.PYS.LIST.QUOTE',
        link: '/analytics',
        parentId: 5
      },
      {
        id: 11,
        label: 'MENUITEMS.PYS.LIST.REQUEST',
        link: '/crm',
        parentId: 5
      }
    ]
  },
  {
    id: 11,
    label: 'MENUITEMS.DASHBOARD.LIST.USERS',
    icon: 'ri-user-3-line',
    link: '/pages/team',
    onlyAdmin: true
  },
  {
    id: 14,
    label: 'MENUITEMS.PROFILE.TEXT',
    icon: 'ri-user-line',
    link: '/pages/profile'
  }
];
