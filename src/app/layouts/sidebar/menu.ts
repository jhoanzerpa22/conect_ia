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
    label: 'MENUITEMS.DASHBOARD.LIST.PROJECTS',
    icon: 'ri-clipboard-line',
    link: '/projects'
  },
  {
    id: 4,
    label: 'MENUITEMS.LIBRARY.TEXT',
    icon: 'ri-zoom-in-line',
    link: '/projects'
  },
  {
    id: 5,
    label: 'MENUITEMS.PYS.TEXT',
    icon: 'ri-stack-line',
    subItems: [
      {
        id: 6,
        label: 'MENUITEMS.PYS.LIST.QUOTE',
        link: '/analytics',
        parentId: 5
      },
      {
        id: 7,
        label: 'MENUITEMS.PYS.LIST.REQUEST',
        link: '/crm',
        parentId: 5
      }
    ]
  }
];
