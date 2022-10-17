import { defineStore } from 'pinia';

export const useOpenTTSStore = defineStore('opentts', {
  state: () => ({
    serverURL: 'http://localhost:5500',
    languages: [],
    voices: [],
    selectedVoice: null,
    selectedLanguage: null,
    selectedSpeaker:null
  }),
  getters: {

  },
  actions: {

    async initialize() {
      
      const url  = localStorage.getItem('url');

      if(url){
        this.serverURL = url;
      }

      this.selectedLanguage = localStorage.getItem('language');

      await this.fetchLanguages();
      await this.fetchVoices();
      
      const voice = localStorage.getItem('voice');
      this.selectedVoice = this.voices.find(v => v.id === voice);
    },
    
    async fetchSound(text) {

      const ret = await this.api.get(this.serverURL + '/api/tts', {
        params: {
          text,
          voice: this.selectedVoice.query,
          speakerId:this.selectedSpeaker
        },
        responseType: 'blob'
      });

      return ret.data;
    },

    async fetchLanguages() {
      const languages = await this.api.get(this.serverURL + '/api/languages');
      this.languages = languages.data.sort();

    },

    async fetchVoices() {
      const voices = await this.api.get(this.serverURL + '/api/voices', {
        params: {
          language: this.selectedLanguage
        }
      });


      console.log(this.voices);

      this.voices = Object.entries(voices.data).map(v => ({...v[1],query:v[0]}));
    },
  },
});
