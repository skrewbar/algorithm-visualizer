<template>
  <div ref="editor" style="height: 100%; width: 100%"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { useTemplateRef, onMounted } from 'vue'

const editor = useTemplateRef('editor')

const textModel = defineModel<string>()

onMounted(() => {
  monaco.editor.create(editor.value!, {
    value: textModel.value!,
  })
})
</script>
