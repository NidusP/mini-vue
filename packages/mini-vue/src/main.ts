import './style.css'
import { createApp} from '@mini-vue/runtime-core'
import RunTime from './components/RunTime'

const rootContainer = document.querySelector("#app");
createApp(RunTime).mount(rootContainer);

