import { defineStore } from 'pinia';
import download from 'downloadjs';

export const useSpeechStore = defineStore('speech', {
    state: () => {
        return {
            title:'',
            text: '',
            path: '',
            delimiters: [
                {
                    id: 'line',
                    format: /\r?\n/
                },
                {
                    id: 'paragraph',
                    format: /\r?\n(?:\r?\n)+/
                },
                {
                    id: 'period',
                    format: '.'
                },
            ],
            selectedDelimiter: null,
            sections: [],
            currentPlaying: -1
        }
    },
    getters: {
        delimiter: (state) => state.selectedDelimiter?.format,
        isPlaying: (state) => state.currentPlaying !== -1 ? !state.sections[state.currentPlaying].audio?.paused : false,
    },
    actions: {

        splitFile() {
            this.sections = this.text.split(this.delimiter).map(s => ({ text: s.trim() })).filter(s => s.text !== "");
        },

        setSectionAudio(index, data) {

            const audio = new Audio();
            const url = URL.createObjectURL(data);
            audio.src = url;
            audio.addEventListener("ended",() => {
                this.stopSectionAudio();
            });
            this.sections[index].data = data;
            this.sections[index].audio = audio;

        },

        sectionHasAudio(index) {
            return !!this.sections[index].audio
        },

        playSectionAudio(index) {

            if (this.currentPlaying === index) {
                this.stopSectionAudio();
                return;
            }

            if (this.currentPlaying !== -1) {
                this.stopSectionAudio();
            }
            this.sections[index].audio.play();
            this.currentPlaying = index;
        },

        stopSectionAudio() {

            if (this.currentPlaying === -1) {
                return;
            }

            this.sections[this.currentPlaying].audio.pause();
            this.sections[this.currentPlaying].audio.curretTime = 0;
            this.currentPlaying = -1;
        },

        removeAudio() {
            this.stopSectionAudio();
            this.sections.forEach(s => {
                delete s.audio;
                delete s.data;
            })
        },

        downloadSection(index){
            const data = this.sections[index].data;
            const text = this.sections[index].text;
            const title = text.toLowerCase().split(' ').slice(0,3).join('-');
            download(data, title +'.wav', data.type);
        }
    },
});
