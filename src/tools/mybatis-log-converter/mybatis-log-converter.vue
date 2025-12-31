<script setup lang="ts">
import { ref, watch } from 'vue';
import { convertMybatisLog } from './mybatis-log-converter.service';
import { useCopy } from '@/composable/copy';

// 初始测试用例
const rawLog = ref(`==>  Preparing: SELECT COUNT(*) FROM user_info WHERE status = ?
==> Parameters: 1(Integer)

==>  Preparing: SELECT * FROM user_info WHERE status = ? LIMIT ?
==> Parameters: 1(Integer), 10(Integer)

==>  Preparing: SELECT * FROM users WHERE name = ?
==> Parameters: 'Admin User'(String)

==>  Preparing: INSERT INTO logs (msg) VALUES (?)
==> Parameters: 'It\\'s a test'(String)`);

const convertedSql = ref('');
const errorMessage = ref('');
const autoConvert = ref(true);

function handleConvert() {
  const input = rawLog.value;
  if (!input.trim()) {
    convertedSql.value = '';
    errorMessage.value = '';
    return;
  }

  const result = convertMybatisLog(input);

  if (result.success) {
    convertedSql.value = result.sql;
    errorMessage.value = '';
  }
  else {
    convertedSql.value = '';
    errorMessage.value = result.error || '转换失败，请检查日志格式';
  }
}

watch(rawLog, () => {
  if (autoConvert.value) {
    handleConvert();
  }
}, { debounce: 300 });

const { copy } = useCopy({ source: convertedSql, text: 'SQL 已复制到剪贴板' });

function loadExample() {
  rawLog.value = `==>  Preparing: SELECT COUNT(*) FROM user_info WHERE status = ?
==> Parameters: 1(Integer)

==>  Preparing: SELECT * FROM user_info WHERE status = ? LIMIT ?
==> Parameters: 1(Integer), 10(Integer)

==>  Preparing: SELECT * FROM users WHERE name = ?
==> Parameters: 'Admin User'(String)

==>  Preparing: INSERT INTO logs (msg) VALUES (?)
==> Parameters: 'It\\'s a test'(String)`;
  handleConvert();
}

function clearAll() {
  rawLog.value = '';
  convertedSql.value = '';
  errorMessage.value = '';
}
</script>

<template>
  <div h-full flex flex-col gap-4>
    <!-- 头部：标题与操作区 -->
    <div flex items-center justify-between>
      <h3 flex items-center gap-2 text-xl font-bold>
        <icon-mdi-database-arrow-down text-gray-600 dark:text-gray-300 />
        MyBatis Log Converter
      </h3>

      <div flex items-center gap-2>
        <label flex cursor-pointer items-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors>
          <input v-model="autoConvert" type="checkbox">
          <span>{{ $t('tools.mybatis-log-converter.autoConvert') }}</span>
        </label>

        <c-button @click="loadExample">
          {{ $t('tools.mybatis-log-converter.loadExample') }}
        </c-button>

        <c-button @click="clearAll">
          {{ $t('tools.mybatis-log-converter.clear') }}
        </c-button>
      </div>
    </div>

    <!-- 主体：上下结构 -->
    <!-- 修改点：去掉 min-h-0，允许内容撑开，或者设置为 overflow-auto 防止溢出 -->
    <div flex flex-1 flex-col gap-4 style="overflow: hidden;">

      <!-- 输入区：强制固定高度 -->
      <!-- 修改点：使用 flex-none 防止被压缩，style="height: 400px" 强制初始高度 -->
      <div class="flex flex-col gap-2 flex-none" style="height: 400px;">
        <div flex items-center justify-between px-1>
          <span text-sm font-bold text-gray-600 dark:text-gray-400>
            {{ $t('tools.mybatis-log-converter.inputLabel') }}
          </span>
        </div>

        <!-- 修改点：去掉 min-h-[300px]，直接用 style="height: 100%" 继承父级高度 -->
        <div class="input-wrapper flex-1 relative group">
          <c-input-text
            v-model:value="rawLog"
            multiline
            :placeholder="$t('tools.mybatis-log-converter.inputPlaceholder')"
            class="h-full w-full"
            monospace
            placeholder-text="text-gray-400"
            text-placeholder="text-gray-500"
          />
        </div>

        <div v-if="!autoConvert" flex justify-end>
          <c-button type="primary" @click="handleConvert">
            <icon-mdi-play class="mr-2" />
            {{ $t('tools.mybatis-log-converter.convert') }}
          </c-button>
        </div>
      </div>

      <!-- 输出区：占据剩余空间 -->
      <div min-h-0 flex flex-1 flex-col gap-2 style="overflow: hidden;">
        <div flex items-center justify-between px-1>
          <span text-sm font-bold text-gray-600 dark:text-gray-400>
            {{ $t('tools.mybatis-log-converter.outputLabel') }}
          </span>
          <c-button v-if="convertedSql" text type="primary" @click="copy">
            <icon-mdi-content-copy class="mr-1" />
            {{ $t('tools.mybatis-log-converter.copy') }}
          </c-button>
        </div>

        <!-- 输出容器 -->
        <div
          class="output-wrapper relative min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
          bg-gray-50
          dark:bg-[#282c34]
        >
          <div
            v-if="errorMessage"
            mb-2
            p-2
            text-sm
            text-red-500
            bg-red-50
            dark:bg-red-900
            bg-opacity-20
            rounded
            border
            border-red-200
            dark:border-red-800
          >
            <icon-mdi-alert-circle class="inline mr-1" />
            {{ errorMessage }}
          </div>
          <pre
            class="whitespace-pre-wrap break-all p-4 text-sm font-mono leading-relaxed"
            text-gray-700
            dark:text-gray-300
            style="margin: 0;"
          >{{ convertedSql || $t('tools.mybatis-log-converter.waitingInput') }}</pre>
        </div>
      </div>

    </div>
  </div>
</template>
