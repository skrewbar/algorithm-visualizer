<template>
  <div id="editor"></div>
  <q-btn
    @click="$emit('getText', editor.getValue())"
    push
    color="white"
    text-color="primary"
    label="Push"
  />
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { onMounted } from 'vue'

defineEmits(['getText'])

let editor: monaco.editor.IStandaloneCodeEditor

onMounted(() => {
  editor = monaco.editor.create(document.getElementById('editor')!, {
    value: `\
3
1 2
2 3
3 1`,
    automaticLayout: true,
  })
})
</script>

<style lang="css" scoped>
#editor {
  height: 100%;
  width: 100%;
}
</style>
