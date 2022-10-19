<template>
  <q-item>
    <q-item-section>
      <q-item-label>{{text}}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn :icon="playIcon" round flat @click="play" :loading="loading" :disabled="loading"></q-btn>
    </q-item-section>
    <q-item-section side>
      <q-btn icon="download" round flat @click="downloadFile" :loading="loading" :disabled="loading"></q-btn>
    </q-item-section>
  </q-item>
</template>
<script>

import { ref, watch } from 'vue';

import { useOpenTTSStore } from 'src/stores/opentts';
import { useSpeechStore } from 'src/stores/speech';
import { storeToRefs } from 'pinia';

export default {
  props: ['index', 'text'],
  setup(props) {

    const opentts = useOpenTTSStore();
    const speech = useSpeechStore();

    const playIcon = ref('play_arrow');
    const loading = ref(false);

    const { currentPlaying } = storeToRefs(speech);

    watch(currentPlaying, (val) => {

      if (val === props.index) {
        playIcon.value = 'pause';
      } else {
        playIcon.value = 'play_arrow';
      }
    })

    return {
      loading,
      playIcon,
      async play() {

        if (!speech.sectionHasAudio(props.index)) {
          loading.value = true;
          const data = await opentts.fetchSound(props.text);
          speech.setSectionAudio(props.index, data);
          loading.value = false;
        }
        speech.playSectionAudio(props.index);
      },
      async downloadFile() {

        if (!speech.sectionHasAudio(props.index)) {
          loading.value = true;
          const data = await opentts.fetchSound(props.text);
          speech.setSectionAudio(props.index, data);
          loading.value = false;
        }
        speech.downloadSection(props.index);
      }
    }
  }
}
</script>