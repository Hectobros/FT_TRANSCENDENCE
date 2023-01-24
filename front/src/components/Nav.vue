<template>
  <div className="h-full w-full flex flex-col  bg-slate-200 shadow-lg overflow-auto">
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <HomeIcon @click="goHome()"/>
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto ">
    <goToAcc/>
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <goToChat @click="goChat()"/>
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <UserGroupIcon @click="goFriend()" />
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <GoToWatch />
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <NoSymbolIcon @click="goBlock()"/>
  </div>
  <div className="icon w-1/2 mt-2 mb-2 mx-auto "> 
    <Cog8ToothIcon @click="goParam()" />
  </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GoToAcc from './GoToAcc.vue';
import GoToChat from './GoToChat.vue';
import GoToWatch from './GoToWatch.vue';
export default defineComponent({
name : 'navBar',
components : {
  GoToAcc,
  GoToChat,
  GoToWatch
},
methods : {
  goHome()
  {
    this.$router.push('/home');
  },
  goFriend()
  {
    this.$router.push('/friendList');
  },
  goBlock()
  {
    this.$router.push('/blocked');
  },
  goParam()
  {
    this.$router.push('/param');
  },
  goChat()
  {
    this.$router.push('/chat');
  }
  }
})
</script>
<style src="../assets/tailwind.css" />
