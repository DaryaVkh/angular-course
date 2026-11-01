<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    total?: number;
    active?: number;
  }>(),
  {
    total: 5,
    active: 1,
  }
);
</script>

<template>
  <div class="section-timeline">
    <div class="timeline-line" />
    <div class="timeline-nodes">
      <span
        v-for="i in total"
        :key="i"
        class="timeline-dot"
        :class="{ 'is-active': i === active }"
      />
    </div>
  </div>
</template>

<style scoped>
.section-timeline {
  position: relative;
  margin-top: auto;
  margin-bottom: 2.2rem;
  width: 100%;
  display: flex;
  align-items: center;
}

.timeline-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(247, 246, 242, 0.2);
}

.timeline-nodes {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5%;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #171614;
  border: 1.5px solid rgba(247, 246, 242, 0.55);
  transition: all 0.3s ease;
}

.timeline-dot.is-active {
  background: #4f98a3;
  border-color: #4f98a3;
  box-shadow: 0 0 14px rgba(79, 152, 163, 0.6);
  transform: scale(1.12);
}
</style>
