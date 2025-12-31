/**
 * 解析 MyBatis 日志并填充参数
 * 整合了批量解析逻辑与精确的字符串转义逻辑
 */
export interface ConversionResult {
  sql: string
  success: boolean
  error?: string
}

export function convertMybatisLog(logText: string): ConversionResult {
  if (!logText || !logText.trim()) {
    return { sql: '', success: false };
  }

  const lines = logText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const statements: { preparing: string; parameters: Array<{ value: string; type: string }> }[] = [];

  let currentPreparing: string | null = null;

  // 参考 HTML 版本的解析逻辑
  for (const line of lines) {
    // 移除可能存在的前缀 "==>"
    const cleanLine = line.replace(/^==>?\s*/, '');

    if (cleanLine.includes('Preparing:')) {
      // 如果之前有未处理的 Preparing（可能没有 Parameters），先保存它
      if (currentPreparing) {
        statements.push({ preparing: currentPreparing, parameters: [] });
      }
      // 提取 SQL
      currentPreparing = cleanLine.split('Preparing:')[1].trim();
    }
    else if (cleanLine.includes('Parameters:')) {
      // 提取参数部分
      const paramsStr = cleanLine.split('Parameters:')[1].trim();
      const params = parseParametersLine(paramsStr);

      // 将当前的 Preparing 和 Parameters 配对保存
      if (currentPreparing) {
        statements.push({ preparing: currentPreparing, parameters: params });
        currentPreparing = null; // 重置
      }
    }
    // 处理可能存在的“只有 SQL 没有 Parameters”的孤旧行
    else if (currentPreparing && !cleanLine.includes('Parameters:')) {
      // 某些日志格式可能 Parameters 在下一行，或者没有参数
      // 这里暂不处理复杂情况，假设标准格式是紧挨着的
    }
  }

  // 如果循环结束后还有残留的 Preparing
  if (currentPreparing) {
    statements.push({ preparing: currentPreparing, parameters: [] });
  }

  if (statements.length === 0) {
    return { sql: '', success: false, error: '未找到有效的 MyBatis 日志' };
  }

  const results: string[] = [];

  for (const statement of statements) {
    let result = statement.preparing;
    let paramIndex = 0;
    const params = statement.parameters;

    // 替换占位符
    while (result.includes('?') && paramIndex < params.length) {
      const param = params[paramIndex];
      let replacementValue: string;

      // 调用优化后的类型转换函数
      replacementValue = parseValueByType(param.value, param.type);

      // 替换第一个问号
      result = result.replace('?', replacementValue);
      paramIndex++;
    }

    // 格式化 SQL (添加换行以提高可读性)
    result = formatSqlDisplay(result);

    // 添加分号结尾
    if (!result.trim().endsWith(';')) {
      result += ';';
    }

    results.push(result);
  }

  return {
    sql: results.join('\n\n'),
    success: true,
  };
}

/**
 * 解析参数行字符串
 * 参考 HTML 版本: "1(Integer), 10(Integer)"
 */
function parseParametersLine(paramsStr: string): Array<{ value: string; type: string }> {
  if (paramsStr) {
    return paramsStr.split(',').map((param) => {
      const trimmed = param.trim();
      // 正则匹配 value(type)
      const match = trimmed.match(/^(.+)\(([^)]+)\)$/);

      if (match) {
        return {
          value: match[1].trim(),
          type: match[2].trim(),
        };
      }

      // 如果没有类型括号，尝试推断
      return {
        value: trimmed,
        type: '',
      };
    });
  }
  else { return []; }
}

/**
 * 核心优化：根据类型和内容处理值
 * 解决单引号多层嵌套问题
 */
function parseValueByType(value: string, type: string): string {
  const lowerType = type.toLowerCase();

  // 处理 NULL
  if (value === 'null' || value === 'NULL') {
    return 'NULL';
  }

  // 字符串类型：去引号 -> 转义 -> 加引号
  if (['string', 'char', 'date', 'time', 'timestamp'].includes(lowerType)) {
    return formatStringValue(value);
  }

  // 布尔值
  if (lowerType === 'boolean') {
    return value;
  }

  // 数字类型：直接返回，去除可能存在的引号
  if (['integer', 'int', 'long', 'short', 'bigdecimal', 'double', 'float'].includes(lowerType)) {
    return value.replace(/^['"]|['"]$/g, '');
  }

  // 未知类型：如果是数字返回数字，否则当做字符串
  if (isNaN(Number(value))) {
    return formatStringValue(value);
  }

  return value;
}

/**
 * 字符串格式化函数
 * 1. 去除外层引号
 * 2. 智能处理转义符：尽量还原为原始字符串形式
 * 3. 包裹单引号
 */
function formatStringValue(valueStr: string): string {
  // 1. 去除首尾的单引号或双引号
  let cleanStr = valueStr.replace(/^['"]|['"]$/g, '');

  // 2. 处理内部转义
  // MyBatis 日志通常用 \' 表示单引号 (Java 转义)
  // 为了让输出更易读，我们去掉这个反斜杠，直接作为单引号处理
  // 注意：如果直接执行这个 SQL，某些数据库可能需要 ''，但作为展示工具，还原为 'It's' 更直观
  cleanStr = cleanStr.replace(/\\'/g, '\'');

  // 3. 加上外层单引号
  return `'${cleanStr}'`;
}

/**
 * 简单的 SQL 格式化
 */
function formatSqlDisplay(sql: string): string {
  if (!sql) { return ''; }
  return sql
    .replace(/\sSELECT\s/gi, '\nSELECT ')
    .replace(/\sFROM\s/gi, '\nFROM ')
    .replace(/\sWHERE\s/gi, '\nWHERE ')
    .replace(/\sAND\s/gi, '\n  AND ')
    .replace(/\sOR\s/gi, '\n  OR ')
    .replace(/\sLEFT JOIN\s/gi, '\nLEFT JOIN ')
    .replace(/\sINNER JOIN\s/gi, '\nINNER JOIN ')
    .replace(/\sINSERT INTO\s/gi, '\nINSERT INTO ')
    .replace(/\sVALUES\s/gi, '\nVALUES ')
    .trim();
}
