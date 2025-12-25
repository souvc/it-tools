import { Database } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: 'Mysql memo',
  path: '/mysql-memo',
  description: translate('mysql-memo.description'),
  keywords: ['mysql', 'sql', 'database', 'cheat', 'sheet', 'memo', 'db'],
  component: () => import('./mysql-memo.vue'),
  icon: Database,
  createdAt: new Date('2025-12-25'),
});
