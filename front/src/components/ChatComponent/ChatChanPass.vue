<template>
    <div className="absolute flex justify-center h-full w-full overflow-auto m-8">
        <div className="flex flex-col justify-around">
            <div className="flex flex-col justify-around text-center items-center">
                <label for="code">Le channel {{ ChannelName }} est protected :</label><br>
                <span> Merci de rentrer le mot de passe afin de vous connecter</span><br>
                <input @keyup.enter="submit()" v-model="password" type="text" id="code" class="form-input" className="text-center rounded-l h-16 m-10 text-3xl w-48 tracking-wider border-green-500 border-2 focus:outline-none focus:border-4 focus:border-green-700"><br>
                <button type="button" @click="submit()" className="w-48 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
            <div className="h-0 lg:h-1/3">
            </div>
        </div>
    </div>
</template>
    
<script lang="ts">

import { connect } from 'socket.io-client';
import { defineComponent} from 'vue';

interface passReturn
{
    password: string
}

export default defineComponent({
  name: 'ChatChanPass',
  props: {
    ChannelName: {
      type: String,
      default: ''
    },
    Connect: {
      type: Function,
      required: true,
    },
  },
  data() : passReturn{
    return{
    password: '' 
    }
  },
  methods:{
    submit()
    {
      this.Connect(this.password);
    },
  }
})
</script>

<style src="../../assets/tailwind.css">
</style>