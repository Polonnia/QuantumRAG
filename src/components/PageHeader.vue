<template>
  <div class="page-header">
    <div class="title-section">
      <h2 class="page-title">
        <slot name="icon">
          <el-icon v-if="icon" class="title-icon">
            <component :is="icon" />
          </el-icon>
        </slot>
        {{ title }}
      </h2>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>
    
    <div class="action-section">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 8px;
  font-size: 20px;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #909399;
}

.action-section {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .action-section {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
