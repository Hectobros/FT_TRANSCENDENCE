<template>
  <div className="center-x h-full w-full">
    <div className="flex flex-col justify-start w-full h-full lg:w-3/4 rounded-2xl bg-slate-200">
      <div className="w-full h-friendbox">
        <div className="w-full h-full flex flex-col justify-center">
          <div
            className="flex flex-row justify-center w-full rounded-2xl h-4/6 text-slate-500 focus-within:text-green-500 cursor-pointer">
            <input type="text" v-model="newSearch" @keyup.enter="search()" name="search"
              placeholder="Search an other player !" autocomplete="off" aria-label="Search an other player !"
              className="rounded-2xl px-3 placeholder-slate-500 text-slate-500 focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500 w-1/2" />
            <MagnifyingGlassCircleIcon @click="search()" className="" />
            <div v-if="!error && me?.login !== obj?.login" className="icon w-12 mt-1 mb-1 mx-2">
				      <div className="w-1/2">
					      <UserPlusIcon @click="add()"/>
				      </div>
			      </div>
          </div>
        </div>
      </div>
      <div v-if="loading">
        <loadingPage />
      </div>
      <div v-else-if="obj" className="flex flex-col justify-center items-center w-full h-full ">
        <div className="w-44 h-44 mb-4 hidden lg:block">
          <img :src="obj?.actualAvatar.path" className="h-44 w-44 rounded-xl" />
        </div>
        <div className="bg-slate-300 w-3/4 flex flex-col justify-start items-center overflow-auto rounded-2xl h-40">
        <div className="h-full w-full flex flex-col justify-center">
        <div>
          <p className="text-3xl font-bold center-x">{{ obj?.username }}</p>
          <span v-if="obj?.username != obj?.login" className="center-x">({{ obj?.login }})</span>
          <br>
          <span className="center-x">Elo :{{ obj?.stats.level }}</span>
          <div className="flex flex-row justify-center w-full">
            <span>Win : {{ obj?.stats.victories }} </span>
            <div className="w-1/4"> </div>
            <span>Looses : {{ obj?.stats.defeats }} </span>
          </div>
        </div>
        </div>
      </div>
        <div className="h-3/5 w-full flex justify-center">
          <div className="top-0 mt-4 bg-slate-300 w-3/4 h-5/6 flex flex-col justify-start items-center overflow-auto rounded-2xl">
            <div v-if="matches.length == 0" className="flex flex-col justify-start items-center w-full h-full overflow-hidden">
              <img src="@/assets/nogame.gif" className="object-scale-down h-44 w-44 rounded-xl"/>
              <span className="text-slate-500 text-2xl pt-4 pb-4" >No game played yet</span>
            </div>
            <div v-else v-for="(item, index) in this.matches" v-bind:key="index" className="h-24 w-5/6 pt-3">
              <history-box :obj=item :index="index" :results="win(item)" />
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="error" className="flex items-center w-full h-full">
        <errorPage :str="error" />
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { UsersApi,FriendsApi, Configuration, UserOutput, ErrorOutput, ResponseError } from '@/api';
import { getCredentials } from "@/frontJS/cookies";
import errorPage from "@/components/Error.vue";
import loadingPage from "@/components/Loading.vue"

interface UserData {
  obj?: UserOutput;
  me?: UserOutput;
  loading: boolean;
  newSearch: string;
  error: string;
  matches: any
}

import historyBox from '../components/HistoryBox.vue'
import { defineComponent } from "vue";

export default defineComponent({
  name: 'accPage',
  data(): UserData {
    return {
      obj: undefined,
      me: undefined,
      loading: false,
      newSearch: '',
      error: '',
      matches: []
    }
  },
  methods: {
    search: function () {
      this?.$router?.push('/user/' + this.newSearch);
      this.newSearch = '';
      //this.$forceUpdate();
    },
    async fetchData() {
      this.loading = true;
      getCredentials()
        .then((accessToken: string) => {
          const userAPI = new UsersApi(new Configuration({ accessToken: accessToken }))
          userAPI.getUserByID({ login: this.$route?.params.id as string })
            .then((user: UserOutput) => { this.obj = user; })
            .then(() => this.getMatchesHistory(this.obj?.login))
            .catch((msg: ResponseError) => { msg.response.json().then((str: ErrorOutput) => { this.error = str.message; }); }
            )
          userAPI.getUserMe().then((user: UserOutput) => {
            this.me = user
          })
        })
      this.loading = false;
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
          this.matches.sort(function (a: any, b: any) {return b.id - a.id });
        })
        .catch(e => {
          this.$toast(e.message, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
        })
    },
    win(matche: any) : boolean
    {
      if (matche.score1 === matche.score2)
        return true
      if (matche.playerOne.login === this.$route?.params.id)
      {
        if (matche.score1 > matche.score2)
          return true;
        else
          return false;
      }
      else
      {
        if (matche.score2 > matche.score1)
          return true;
        else
          return false;
      }
    },
    async add() {
			getCredentials().then((accessToken: string) => {
				const Fapi = new FriendsApi(new Configuration({ accessToken: accessToken }))
				Fapi.createFriendship({ login: this.$route?.params.id as string })
          .then(()=>{this.$toast("+1 Friend !", {
             styles: { backgroundColor: "#16b918", color: "#FFFFFF" }, 
							})})
					.catch((msg: ResponseError) => {
						msg.response.json().then((str: ErrorOutput) =>
							this.$toast(str.message, {
								styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
							}));
					})
			})}
  },
  components:
  {
    errorPage,
    loadingPage,
    historyBox
  },
  async mounted() {
    await this.fetchData()
  }
})
</script>
  
  







<style src="../assets/tailwind.css" />