<template>
  <div v-if="finished" className="flex flex-row justify-center object-center items-center w-full h-full ">
    <div
      className="flex flex-col justify-between object-center items-center w-full h-full bg-slate-200 lg:w-3/4 rounded-2xl">
      <div className="w-full h-friendbox">
        <div className="w-full h-full flex flex-col justify-center">
          <div
            className="flex flex-row justify-center w-full rounded-2xl h-4/6 text-slate-500 focus-within:text-green-500 cursor-pointer">
            <input type="text" v-model="newSearch" @keyup.enter="search()" name="search"
              placeholder="Search an other player !" autocomplete="off" aria-label="Search an other player !"
              className="rounded-2xl px-3 placeholder-slate-500 text-slate-500 focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500 w-1/2" />
            <MagnifyingGlassCircleIcon @click="search()" className="" />
          </div>
        </div>
      </div>
      <div className="w-44 h-44 mb-4 hidden lg:block">
        <img :src="obj?.actualAvatar.path" className="h-44 w-44 rounded-xl" />
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="bg-slate-300 w-3/4 flex flex-col justify-start items-center rounded-2xl h-40">
          <div className="h-full w-full flex flex-col justify-center">
          <div>
          <p className="text-3xl font-bold center-x">{{ obj?.username }}</p>
          <span v-if="obj?.username != obj?.login" className="center-x">({{ obj?.login }})</span>
          <br>
          <span className="center-x">Elo: {{ obj?.stats.level }}</span>
          <div className="flex flex-row justify-center w-full">
            <span>Win: {{ obj?.stats.victories }} </span>
            <div className="w-1/4"> </div>
            <span>Looses: {{ obj?.stats.defeats }} </span>
          </div>
        </div>
        </div>
        </div>
      </div>
      <div className="h-3/5 w-full flex justify-center">
        <div className="top-0 mt-4 bg-slate-300 w-3/4 h-5/6 flex flex-col justify-start items-center overflow-auto rounded-2xl">
          <div v-if="matches.length == 0"
            className="flex flex-col justify-start items-center w-full h-full overflow-hidden">
            <img src="@/assets/nogame.gif" className="object-scale-down h-44 w-44 rounded-xl" />
            <span className="text-slate-500 text-2xl pt-4">No game played yet</span>
          </div>
          <div v-else v-for="(item, index) in this.matches" v-bind:key="index" className="h-24 w-5/6 pt-3">
            <history-box :obj=item :index="index" :results="win(item)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { UsersApi, Configuration, UserOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies"

interface UserData {
  obj?: UserOutput;
  finished: boolean;
  newSearch: string;
  matches: any;
}

import historyBox from '../components/HistoryBox.vue'
import { defineComponent } from "vue";

export default defineComponent({
  name: 'accPage',
  data(): UserData {
    return {
      obj: undefined,
      finished: false,
      newSearch: '',
      matches: []
    }
  },
  methods: {
    getImgUrl: function (img: string) {
      return require('@/assets/' + img);
    },
    search: function () {
      this?.$router?.push('/user/' + this.newSearch);
      this.newSearch = '';
      //this.$forceUpdate();
    },
    async fetchData() {
      getCredentials().then((accessToken: string) => {
        const userAPI = new UsersApi(new Configuration({ accessToken: accessToken }))
        userAPI.getUserMe().then((user: UserOutput) => {
          this.obj = user
          this.finished = true
        })
          .then(() => this.getMatchesHistory(this.obj?.login))
      })
    },
    async getMatchesHistory(login: string | undefined) {
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
      await fetch(`http://${process.env.VUE_APP_IP}:3005/match/history/${login}`, requestOptions)
        .then(res => res.json())
        .then(data => {
          this.matches = data;
          this.matches.sort(function (a: any, b: any) { return b.id - a.id });
        })
        .catch(e => {
          this.$toast(e.message, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
        })
    },
    win(matche: any): boolean {
      if (matche.score1 === matche.score2)
        return true
      if (matche.playerOne.login === this.obj?.login) {
        if (matche.score1 > matche.score2)
          return true;
        else
          return false;
      }
      else {
        if (matche.score2 > matche.score1)
          return true;
        else
          return false;
      }
    }
  },
  components:
  {
    historyBox
  },
  async created() {
    await this.fetchData();
  }
})
</script>
  
  















<style src="../assets/tailwind.css" />