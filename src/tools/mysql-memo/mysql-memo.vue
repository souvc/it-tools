<script setup lang="ts">
import { ref } from 'vue';
import { NCard, NCode, NIcon, NInput } from 'naive-ui';
import { Search as SearchIcon } from '@vicons/tabler';
import { useI18n } from 'vue-i18n';

// 使用 useI18n 组合式函数
const { t } = useI18n();

// 搜索状态
const searchQuery = ref('');

// 简单的过滤逻辑
function filterItems(keywords: string[]) {
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return keywords.some(keyword => keyword.includes(query));
  } else {
    return true;
  }
}

// SQL 代码片段数据
const snippets = {
  // 1. 数据库基础
  database: `-- 1. 创建与删除数据库
CREATE DATABASE IF NOT EXISTS my_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 查看所有数据库
SHOW DATABASES;

-- 选择数据库
USE my_database;

-- 删除数据库 (慎用)
DROP DATABASE IF EXISTS my_database;`,

  // 2. 表操作与字段
  table: `-- 2. 创建表 (命名规范: t_ 或 tbl_ 前缀)
CREATE TABLE t_users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  status TINYINT DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 查看表结构
DESCRIBE t_users;
SHOW CREATE TABLE t_users;

-- 重命名表
RENAME TABLE t_users TO t_sys_users;

-- 删除表
DROP TABLE IF EXISTS t_users;`,

  // 3. 结构与索引
  structure: `-- 3. 修改字段
-- 添加列
ALTER TABLE t_users ADD COLUMN age INT AFTER username;

-- 修改列类型
ALTER TABLE t_users MODIFY COLUMN age TINYINT;

-- 重命名列
ALTER TABLE t_users CHANGE COLUMN age user_age TINYINT;

-- 删除列
ALTER TABLE t_users DROP COLUMN user_age;

-- 4. 索引操作
-- 添加普通索引
CREATE INDEX idx_username ON t_users(username);

-- 添加唯一索引
CREATE UNIQUE INDEX idx_email ON t_users(email);

-- 添加全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- 删除索引
ALTER TABLE t_users DROP INDEX idx_username;`,

  // 4. CRUD 基础操作
  crud: `-- 5. 插入数据
INSERT INTO t_users (username, email, status)
VALUES
  ('ZhangSan', 'zhang@example.com', 1),
  ('LiSi', 'li@example.com', 1);

-- 插入如果不存在 (重复则忽略)
INSERT IGNORE INTO t_users (id, username) VALUES (1, 'Test');

-- 6. 查询数据
SELECT * FROM t_users WHERE status = 1 ORDER BY id DESC LIMIT 10;

-- 7. 更新数据
UPDATE t_users SET email = 'new@example.com' WHERE id = 1;

-- 8. 删除数据
DELETE FROM t_users WHERE id = 1;

-- 清空表 (重置自增ID，比 DELETE 快)
TRUNCATE TABLE t_users;`,

  // 5. 高级查询与逻辑
  logic: `-- 9. 条件筛选与逻辑
-- 模糊查询
SELECT * FROM t_users WHERE username LIKE '%Zhang%';

-- 范围查询
SELECT * FROM t_users WHERE id BETWEEN 10 AND 50;

-- 空值判断
SELECT * FROM t_users WHERE email IS NULL;

-- 聚合函数
SELECT COUNT(*) as total, AVG(age) as avg_age FROM t_users;

-- 分组统计
SELECT status, COUNT(*) as count FROM t_users GROUP BY status HAVING count > 0;

-- 连接查询 (LEFT JOIN)
SELECT u.*, o.order_no
FROM t_users u
LEFT JOIN t_orders o ON u.id = o.user_id
WHERE u.id = 1;`,

  // 6. 视图、存储过程、触发器
  advanced: `-- 10. 视图
CREATE VIEW v_user_orders AS
SELECT u.username, o.order_no, o.amount
FROM t_users u
JOIN t_orders o ON u.id = o.user_id;

-- 11. 存储过程
DELIMITER //
CREATE PROCEDURE GetUserById(IN userId INT)
BEGIN
  SELECT * FROM t_users WHERE id = userId;
END //
DELIMITER ;

-- 调用存储过程
CALL GetUserById(1);

-- 12. 触发器 (示例：插入前记录日志)
DELIMITER //
CREATE TRIGGER before_user_insert
BEFORE INSERT ON t_users
FOR EACH ROW
BEGIN
  INSERT INTO t_logs(action, created_at) VALUES('NEW_USER_INSERT', NOW());
END //
DELIMITER ;`,

  // 7. 用户权限与管理
  admin: `-- 13. 创建用户与登录
-- 创建本地用户
CREATE USER 'dev_admin'@'localhost' IDENTIFIED BY 'StrongPassword123!';

-- 创建远程可访问用户
CREATE USER 'remote_user'@'%' IDENTIFIED BY 'Password123!';

-- 修改用户密码
ALTER USER 'dev_admin'@'localhost' IDENTIFIED BY 'NewPassword456!';

-- 14. 权限分配
-- 授权所有权限 (ALL PRIVILEGES)
GRANT ALL PRIVILEGES ON my_database.* TO 'dev_admin'@'localhost';

-- 授权特定权限 (SELECT, INSERT, UPDATE)
GRANT SELECT, INSERT, UPDATE ON my_database.* TO 'app_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'dev_admin'@'localhost';

-- 删除用户
DROP USER 'dev_admin'@'localhost';`,

  // 8. 备份与恢复 (命令行)
  backup: `-- 注意: 以下命令通常在系统终端 (CMD/Bash) 中执行，而非 SQL 客户端内

-- 15. 备份数据库
mysqldump -u root -p my_database > backup_2023.sql

-- 备份所有数据库
mysqldump -u root -p --all-databases > all_backup.sql

-- 备份表结构 (不含数据)
mysqldump -u root -p -d my_database > schema.sql

-- 16. 恢复数据库
mysql -u root -p my_database < backup_2023.sql

-- 17. 在 SQL 客户端中导入数据
SOURCE /path/to/backup_2023.sql;`,
};
</script>

<template>
  <div class="container">
    <div class="header">
      <h2>{{ $t('tools.mysql-memo.title') }}</h2>
      <p class="subtitle">
        {{ $t('tools.mysql-memo.description') }}
      </p>
    </div>

    <NInput
      v-model:value="searchQuery"
      :placeholder="$t('tools.mysql-memo.searchPlaceholder')"
      clearable
      class="search-bar"
    >
      <template #prefix>
        <NIcon :component="SearchIcon" />
      </template>
    </NInput>

    <div class="cheat-sheet-grid">
      <NCard
        v-if="filterItems(['database', 'create', 'show', 'use', 'drop', 'character'])"
        :title="$t('tools.mysql-memo.cardDatabase')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.database" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['table', 'create', 'alter', 'drop', 'describe', 'rename', 'engine'])"
        :title="$t('tools.mysql-memo.cardTable')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.table" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['index', 'column', 'modify', 'primary', 'unique', 'structure'])"
        :title="$t('tools.mysql-memo.cardStructure')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.structure" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['insert', 'select', 'update', 'delete', 'truncate'])"
        :title="$t('tools.mysql-memo.cardCrud')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.crud" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['where', 'like', 'in', 'order', 'limit', 'join', 'group'])"
        :title="$t('tools.mysql-memo.cardLogic')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.logic" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['view', 'procedure', 'trigger', 'function', 'delimiter'])"
        :title="$t('tools.mysql-memo.cardAdvanced')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.advanced" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['user', 'grant', 'flush', 'password', 'privileges'])"
        :title="$t('tools.mysql-memo.cardAdmin')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.admin" language="sql" />
        </div>
      </NCard>

      <NCard
        v-if="filterItems(['backup', 'restore', 'mysqldump', 'import', 'export'])"
        :title="$t('tools.mysql-memo.cardBackup')"
        size="small"
      >
        <div class="code-wrapper">
          <NCode :code="snippets.backup" language="bash" />
        </div>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

.subtitle {
  color: #888;
  margin-top: -10px;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
}

.cheat-sheet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* 代码容器：改为浅色背景，增加圆角和内边距 */
.code-wrapper {
  overflow-x: auto;
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f7fa; /* 浅灰背景 */
  border: 1px solid #e4e7ed; /* 淡淡的边框 */
}

/* 深度选择器：强制覆盖 NCode 组件内部样式 */
.code-wrapper :deep(.n-code) {
  background-color: transparent !important; /* 去掉 NCode 自带的黑色背景 */
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace; /* 使用更好的编程字体 */
  font-size: 13px;
  line-height: 1.6;
}

/* 修复关键字颜色 (针对常见 SQL 关键字) */
.code-wrapper :deep(.token.keyword) {
  color: #c678dd !important; /* 紫色关键字 */
}
.code-wrapper :deep(.token.string) {
  color: #98c379 !important; /* 绿色字符串 */
}
.code-wrapper :deep(.token.function) {
  color: #61afef !important; /* 蓝色函数 */
}
.code-wrapper :deep(.token.comment) {
  color: #7f848e !important; /* 灰色注释，淡一点 */
  font-style: italic;
}

@media (max-width: 600px) {
  .cheat-sheet-grid {
    grid-template-columns: 1fr;
  }
}
</style>
