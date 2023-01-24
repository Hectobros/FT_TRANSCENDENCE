<template>
  <div className="flex flex-col justify-start items-center w-full h-full overflow-auto">
    <div v-if="loading">
      <loadingPage />
    </div>
    <div v-else-if="this.tab.length === 0 && !loading" className="pt-32">
      <img src="@/assets/nospectate.gif" className="object-scale-down h-56 w-56 lg:h-80 lg:w-80" />
      <span className="center-x text-slate-500 text-2xl"> No one is playing :/ </span>
    </div>
    <div v-else>
      <div v-for="(item, index) in this.tab" v-bind:key="index" className="pt-3">
        <spectateBox :obj=item :index="index" />
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import spectateBox from '../components/SpectateBox.vue';
import io from 'socket.io-client';
import { defineComponent } from "vue";
import loadingPage from "@/components/Loading.vue"

interface spectateData {
  tab: Array<any>;
  socket: any;
  loading: boolean;
}

export default defineComponent({
  name: 'spectatePage',
  data(): spectateData {
    return {
      socket: null,
      tab: [],
      loading: true
    };
  },
  components: {
    spectateBox,
    loadingPage,
  },
  methods:
  {
    async getLiveMatches() {
      const requestOptions =
      {
        method: "GET",
        headers:
        {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': this.$cookies.get("trans_access")
        },
      }
      await fetch(`http://${process.env.VUE_APP_IP}:3005/match/live`, requestOptions)
        .then(res => res.json())
        .then(data => this.tab = data)
        .then(() => { this.loading = false })
        .catch(e => {
          this.$toast(e.message, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
          this.$router.push("/");
        })
    }
  },
  mounted() {
    setTimeout(() => { this.getLiveMatches() }, 1000)
    const authPayload = { auth: { token: this.$cookies.get("trans_access") } };
    this.socket = io("http://" + process.env.VUE_APP_IP + ":3005", authPayload);
    this.socket.on('liveMatches', (payload: any) => {
      this.tab = [];
      this.tab = payload;
      this.tab.sort(function (a: any, b: any) { return a.id - b.id });
    });
    this.socket.on('updateLiveMatches', async (payload: any) => {
      this.tab = [];
      // await this.getLiveMatches();
      setTimeout(() => { this.getLiveMatches() }, 1000)
    })
  },
  unmounted() {
    this.socket.disconnect();
  },
})
</script>

<style src="../assets/tailwind.css" />