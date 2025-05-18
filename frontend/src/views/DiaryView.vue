<template>
  <div class="app">
    <DiaryEditor 
      v-if="editingDiary" 
      :diary="editingDiary"
      @save="handleSave"
    />
    <DiaryList 
      v-else 
      :diaries="diaries" 
      @edit="editingDiary = $event"
    />
  </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import DiaryList from '../components/DiaryList.vue';
    import DiaryEditor from '../components/DiaryEditor.vue';
    import type { Diary } from '../types';

    const diaries = ref<Diary[]>([]);
    const editingDiary = ref<Diary | null>(null);

    const handleSave = (diary: Diary) => {
        if (editingDiary.value?.id) {
            // 更新现有日记
            const index = diaries.value.findIndex(d => d.id === diary.id);
            diaries.value[index] = diary;
        } else {
            // 添加新日记
            diaries.value.push({
            ...diary,
            id: Date.now().toString()
            });
        }
        editingDiary.value = null;
    };
</script>