<template>
  <RouterLink v-if="destination?.internal" v-bind="$attrs" :to="destination.href"><slot></slot></RouterLink>
  <a v-else-if="destination" v-bind="$attrs" :href="destination.href" target="_blank" rel="noopener noreferrer"><slot></slot></a>
  <slot v-else name="fallback"></slot>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// Links in a report come from run results, not the route table.
defineOptions({ inheritAttrs: false })
const props = defineProps({ path: { type: String, default: '' } })

const destination = computed(() => {
  if (!props.path) return null
  try {
    const url = new URL(props.path, window.location.origin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.origin === window.location.origin) {
      return { internal: true, href: `${url.pathname}${url.search}${url.hash}` }
    }
    return { internal: false, href: url.href }
  } catch {
    return null
  }
})
</script>
