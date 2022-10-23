<template>
  <q-page padding>
    <div class="text-h5 q-my-md">{{$t('settings')}}</div>
    <div class="row q-col-gutter-md col-auto">
      <div class="col-4">
        <q-file outlined :label="$t('source')" v-model="path" :disable="isPlaying" clearable></q-file>
      </div>
      <div class="col-3">
        <q-select outlined :label="$t('delimiter')" :options="delimiterOptions" v-model="selectedDelimiter" clearable :disable="isPlaying"></q-select>
      </div>
      <div class="col-3">
        <q-input outlined :label="$t('openttsServer')" v-model="serverURL" placeholder="http://localhost:5500" :disable="isPlaying"></q-input>
      </div>
    </div>
    <div class="row q-col-gutter-md q-my-md">
      <div class="col-2">
        <q-select outlined :label="$t('language')" :options="languages" v-model="selectedLanguage" :disable="isPlaying"></q-select>
      </div>
      <div class="col-3">
        <q-select outlined :label="$t('voice')" :options="voices" v-model="selectedVoice" :option-label="voiceLabel"
          option-value="id" :disable="isPlaying"></q-select>
      </div>
      <div class="col-3">
        <q-select outlined :label="$t('speaker')" :options="speakers" v-model="selectedSpeaker" v-if="speakers.length > 0" :disable="isPlaying">
        </q-select>
      </div>
    </div>
    <div class="row q-my-md">
      <div class="col">
        <div class="text-h5">{{$t('sections')}}</div>
      </div>
      <div class="col-auto">
        <q-btn icon="download" flat round @click="downloadAll"></q-btn>
      </div>
    </div>
        <q-list separator bordered>
          <OcSection v-for="section,index in sections" :key="index" :index="index" :text="section.text" />
        </q-list>
  </q-page>
</template>

<script>
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia';
import download from 'downloadjs';
import { ZipWriter, BlobWriter, BlobReader } from "@zip.js/zip.js";

import { useSpeechStore } from 'src/stores/speech';
import { useOpenTTSStore } from 'src/stores/opentts';

import OcSection from '../components/OcSection.vue'

export default defineComponent({
  name: "IndexPage",
  setup() {
    const { t } = useI18n();
    const speech = useSpeechStore();
    const opentts = useOpenTTSStore();

    const { title, path, sections, delimiters, selectedDelimiter, text,isPlaying } = storeToRefs(speech);
    const { serverURL, languages, voices, selectedLanguage, selectedVoice, selectedSpeaker } = storeToRefs(opentts);

    const delimiterOptions = computed(() => delimiters.value.map(d => ({ value: d.id, label: t(d.id), format: d.format })));

    watch(path, async (path) => {
      if (!path) {
        return;
      }

      title.value = path.name.split('.')[0];
      text.value = await path.text();
      speech.splitFile();
    });

    watch(selectedDelimiter, async (val) => {
      if (!path.value) {
        return;
      }
      speech.splitFile();
    });

    watch(selectedLanguage, (language) => {
      if (language) {
        localStorage.setItem('language', language);
      } else {
        localStorage.removeItem('language');
      }
      selectedVoice.value = null;
      opentts.fetchVoices();
    });

    watch(selectedVoice, (voice) => {
      if (voice) {
        localStorage.setItem('voice', voice.id);
      } else {
        localStorage.removeItem('voice');
      }
      selectedSpeaker.value = null;
      speech.removeAudio();
    });

    watch(selectedSpeaker, (speaker) => {
      if (speaker) {
        localStorage.setItem('speaker', speaker);
      } else {
        localStorage.removeItem('speaker');
      }
      speech.removeAudio();
    });

    watch(serverURL, (url) => {
      if (url) {
        localStorage.setItem('url', url);
      } else {
        localStorage.removeItem('url');
      }
      speech.removeAudio();
    });

    return {
      isPlaying,
      serverURL,
      path,
      delimiterOptions,
      languages,
      voices,
      speakers: computed(() => selectedVoice.value && selectedVoice.value.speakers ? Object.entries(selectedVoice.value.speakers).map(s => s[0]) : []),
      sections,
      selectedDelimiter,
      selectedVoice,
      selectedSpeaker,
      selectedLanguage,
      voiceLabel: (item) => item.tts_name + ': ' + item.name,
      async downloadAll() {

        const zipWriter = new ZipWriter(new BlobWriter("application/zip"));

        const sects = sections.value;

        for (let i = 0; i < sects.length; i++) {
          const section = sects[i];
          if (!speech.sectionHasAudio(i)) {
            const data = await opentts.fetchSound(section.text);
            speech.setSectionAudio(i, data);
          }
          const text = section.text;
          const title = text.toLowerCase().split(' ').slice(0,3).join('-');
          await zipWriter.add(i + '-' +  title + '.wav', new BlobReader(section.data));
        }

        const blob = await zipWriter.close();

        download(blob, title.value + '.zip', "application/zip");

      }
    }
  },
  components: { OcSection }
})
</script>
