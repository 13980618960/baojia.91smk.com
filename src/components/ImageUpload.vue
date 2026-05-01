<template>
  <div class="upload-component">
    <el-upload
      class="upload-demo"
      :action="''"
      :auto-upload="false"
      :on-change="handleChange"
      :show-file-list="false"
      :before-upload="beforeUpload"
    >
      <el-button type="primary" :loading="uploadLoading">
        {{ uploadText || '上传图片' }}
      </el-button>
    </el-upload>
    <div v-if="imageUrl" class="image-preview">
      <el-image
        :src="getImageUrl(imageUrl)"
        fit="cover"
        class="preview-image"
      >
        <template #error>
          <div class="image-error">图片加载失败</div>
        </template>
      </el-image>
      <el-button
        type="danger"
        size="small"
        @click="handleRemove"
        class="remove-button"
      >
        删除
      </el-button>
    </div>
    <div v-if="tips" class="upload-tips">{{ tips }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  uploadText: {
    type: String,
    default: '上传图片'
  },
  tips: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const imageUrl = ref(props.modelValue)
const uploadLoading = ref(false)

const getImageUrl = (url) => {
  if (!url) return ''
  if (!url.startsWith('http')) {
    if (url.startsWith('/')) {
      return `https://baojiaapi.91smk.com${url}`
    } else {
      return `https://baojiaapi.91smk.com/uploads/${url}`
    }
  }
  return url
}

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
  if (!isJPG) {
    ElMessage.error('只能上传JPG、PNG、GIF格式的图片')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  
  return true
}

const handleChange = async (file) => {
  uploadLoading.value = true
  
  const formData = new FormData()
  formData.append('file', file.raw)
  formData.append('type', 'ad')
  formData.append('user_id', localStorage.getItem('admin_user_id') || 1)
  
  try {
    const res = await request.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (res.code === 200 && res.data && res.data.length > 0 && res.data[0].url) {
      imageUrl.value = res.data[0].url
      emit('update:modelValue', res.data[0].url)
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    uploadLoading.value = false
  }
}

const handleRemove = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}

// 监听props变化
watchEffect(() => {
  imageUrl.value = props.modelValue
})
</script>

<style scoped>
.upload-component {
  margin-bottom: 15px;
}

.image-preview {
  margin-top: 10px;
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 200px;
  height: 100px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.remove-button {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 0 0 4px 4px;
}

.upload-tips {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}
</style>