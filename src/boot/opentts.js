import { boot } from 'quasar/wrappers'

import { useOpenTTSStore } from 'src/stores/opentts'

export default boot(({ app }) => {
  
  const opentts = useOpenTTSStore();

  opentts.initialize();

})
