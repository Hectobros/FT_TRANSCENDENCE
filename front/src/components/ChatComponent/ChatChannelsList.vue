<template>
  <div class="h-full w-full pl-2 pr-2 divide-y-2 overflow-auto">
    <div>
      <div class="flex flex-row">
        <h1 class="mt-5 font-semibold">DIRECT MESSAGES</h1>
        <div class="h-12 mt-3 ml-2">
          <div class="w-10 h-10
          bg-slate-50 border-4 hover:bg-green-600
          text-gray-500 hover:text-white
          hover:rounded-xl rounded-3xl
          transition-all duration-300 ease-linear
          cursor-pointer shadow-lg">
            <PlusIcon @click="showDMForm()" />
          </div>
        </div>
      </div>
      <div class="mt-1 mb-1">
        <ul class="list-none">
          <li v-for="dm in dmChannels" :key="dm.id">
            <div v-if="this.currentUser?.login === dm.userOne.login || this.currentUser?.login === dm.userTwo.login" class="pb-2 font-semibold hover:text-black">
              <button @click="changeChannel(dm)">
                <span v-if="this.currentUser?.login === dm.userOne.login">📞 {{ dm.userTwo.login }}</span>
                <span v-else-if="this.currentUser?.login === dm.userTwo.login">📞 {{ dm.userOne.login }}</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <div class="flex flex-row">
        <h1 class="mt-5 font-semibold">CHANNELS</h1>
        <div class="h-12 mt-3 ml-2">
          <div class="w-10 h-10
          bg-slate-50 border-4 hover:bg-green-600
          text-gray-500 hover:text-white
          hover:rounded-xl rounded-3xl
          transition-all duration-300 ease-linear
          cursor-pointer shadow-lg">
            <PlusIcon @click="showChanForm()" />
          </div>
        </div>
      </div>  
      <h1 class="mt-3 font-semibold">MY CHANNELS</h1>
      <div class="mt-1">
        <ul class="list-none">
          <li v-for="channel in getMyChannels()" :key="channel.id">
            <div class="pb-2 font-semibold hover:text-black">
              <button @click="changeChannel(channel)">
                 <span v-if="channel.type == 'private'">👁️</span>
                 <span v-else-if="channel.type == 'protected'">🔓</span>
                 <span v-else>✔️</span> 
                {{ channel.name }}
              </button>
            </div>
          </li>
        </ul>
      </div>
      <h1 class="mt-3 font-semibold">OTHER CHANNELS</h1>
      <div class="mt-1">
        <ul class="list-none">
          <li v-for="channel in getPublic()" :key="channel.id">
            <div class="pb-2 font-semibold hover:text-black">
              <button @click="changeChannel(channel)"> #  {{ channel.name }}</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="mt-1">
        <ul class="list-none">
          <li v-for="channel in getProtected()" :key="channel.id">
            <div class="pb-2 font-semibold hover:text-black">
              <button @click="changeChannel(channel)">🔒 {{ channel.name }} </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface DataI {
  allChannels: any[],
  dmChannels: any[],
  regularChannels: any[],
}

export default defineComponent({
  name: "ChatChannelsList",
  props: {
    socket: Object,
    currentChan: Object,
    currentUser: { 
      type: Object,
      required: true
    }
  },
  data(): DataI {
    return {
      allChannels: [],
      dmChannels: [],
      regularChannels: [],
    };
  },
  methods:
  {
    changeChannel(channel: any) {
      this.$emit('selectedChannel', channel);
    },
    showDMForm() {
      this.$emit('showDMForm');
    },
    showChanForm() {
      this.$emit('showChanForm');
    },
    getRole(login: string, chan: any): string {
      for (let j = 0; j < chan["userChannels"].length; j++) {
        if (chan["userChannels"][j].user.login == login)
          return chan["userChannels"][j].role;
      }
      return "undefined";
    },
    isInChan(login: string, chan: any): boolean {
      for (let j = 0; j < chan["userChannels"].length; j++) {
        if (chan["userChannels"][j].user.login == login)
          return true
      }
      return false;
    },
    getAllChannels(channels: any) {
      this.allChannels = channels;
      this.dmChannels = [];
      this.regularChannels = [];

      let arr = channels;
      for (let i = 0; i < arr.length; i++) {
        arr[i].participation = false;
        for (let j = 0; j < arr[i]["userChannels"].length; j++) {
          if (arr[i]["userChannels"][j].user.login == this.currentUser?.login) {
            arr[i].participation = true;
            break;
          }
        }
      }
      arr.sort(function (a: any, b: any) {
        return a.id - b.id;
      });
      arr.forEach((chan: any) => (chan.type == 'direct' ? this.dmChannels : this.regularChannels).push(chan));

    },
    getMyChannels() : Array<any> {
      let channel = [];
      for (let i = 0; i < this.regularChannels.length; i++)
      {
        if (this.isInChan(this.currentUser?.login, this.regularChannels[i]))
          channel.push(this.regularChannels[i]);
      }
      return (channel);
    },
    getPublic() : Array<any> {
      let channel = [];
      for (let i = 0; i < this.regularChannels.length; i++)
      {
        if (!this.isInChan(this.currentUser?.login, this.regularChannels[i]) && this.regularChannels[i].type === 'public')
          channel.push(this.regularChannels[i]);
      }
      return (channel);
    },
    getProtected() : Array<any> {
      let channel = [];
      for (let i = 0; i < this.regularChannels.length; i++)
      {
        if (!this.isInChan(this.currentUser?.login, this.regularChannels[i]) && this.regularChannels[i].type === 'protected')
          channel.push(this.regularChannels[i]);
      }
      return (channel);
    }
  },
  created() {
    this.socket?.on('allChansToClient', (channels: any) => {
      this.getAllChannels(channels)
    })
    this.socket?.emit('getAllChannels');
  },
});
</script>

<style src="../../assets/tailwind.css" />