import { DatabaseImport } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  // 这里 name 作为路由的一部分，通常不需要国际化，或者保持英文
  name: 'mybatis-log-converter',
  path: '/mybatis-log-converter',
  // 这里的 description 会被前端 i18n 覆盖，如果找不到 key 才会显示这个
  description: 'MyBatis Log Converter',
  keywords: ['mybatis', 'log', 'converter', 'sql'],
  component: () => import('./mybatis-log-converter.vue'),
  icon: DatabaseImport,
  createdAt: new Date('2025-12-31'),
});
