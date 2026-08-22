<template>
    <a v-if="sourceUrl" :href="sourceUrl" target="_blank" rel="noopener noreferrer">{{ $t("source") }}</a>
    <span v-else>{{ $t("source") }}: {{ source }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { resolveSourceUrl } from "@/composables/sourceLink";

const props = defineProps<{
    source: string;
}>();

const sourceUrl = computed(() => resolveSourceUrl(props.source));
</script>
