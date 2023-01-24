<template>
  <div v-if="loading" className="h-full w-full flex flex-col justify-center items-center">
    <loadingPage/>
  </div>
  <div v-else-if="twoFa" className="absolute flex justify-center h-full w-full overflow-auto m-8">
    <div className="flex flex-col justify-around">
      <div className="flex flex-col justify-around text-center items-center" >
          <label for="code">Le 2FA a été activé.</label><br>
          <span> Afin de vous connecter, merci de rentrer le code qui a été envoyé à l'adresse</span><br>
          <span> <b>{{ email }}</b></span><br>

 
          <input type="text" v-model="code" id="code" @keyup.enter="submit()" class="form-input" maxlength="6" className="text-center h-16 m-10 text-3xl w-48 tracking-wider border-green-500 border-2 focus:outline-none focus:border-4 focus:border-green-700"><br>
          <button type="button" @click="submit()" className="w-48 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
      </div>
        <div className="h-0 lg:h-1/3">
      </div>
    </div>
    </div>
    <div v-else className="h-full w-full flex flex-col justify-center items-center pb-5 pt-5">
      <img src="@/assets/cookies.gif" className="object-scale-down h-44 w-44 rounded-xl">
      <p>Loading cookies...</p>
    </div>
</template>


<script lang="ts">
import { AuthenticationApi, UsersApi, Configuration, ResponseError } from "@/api";
import { ErrorOutput, OauthToken, UserOutput, UserOutputToJSON } from "@/api/models";
import { defineComponent } from "vue";
import { setRefreshCookie, setAccessCookie } from "@/frontJS/cookies";
import io from 'socket.io-client';
import loadingPage from "@/components/Loading.vue"

interface CbReturn {
    obj?: UserOutput;
    twoFa: boolean;
    loading: boolean;
    email: string;
    code: string;
    vala: string; // acces token
    valr: string; //refresh token
}

export default defineComponent({
  name: "callBack",
  mounted() {
    if (!this.$route.query.code) {
      this.$router.push("/");
      this.$toast("Error log", {
        styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
      });
      return;
    }
    const authApi = new AuthenticationApi();
    authApi
      .oauthAuthentication({
        oauthAuthenticationRequest: { code: this.$route.query.code as string },
      })
      .then(async (value: OauthToken) => {
        this.vala = value.accessToken;
        this.valr = value.refreshToken;
        const Uapi =  new UsersApi(new Configuration({ accessToken: value.accessToken }));
        await  Uapi.createUser();
        await Uapi.getUserMe().then((user: UserOutput) => {
          this.obj = user;
          this.twoFa = user.twoFa;
          this.email = user.login + "@student.42.fr";
        })
        this.loading = false;
        if (this.twoFa == false)
        	this.set_and_go();
		else
		{
			this.$store.state.globalSocket = null;
			await this.getMail();
		}
			
      }).catch((errorMsg: ResponseError) => {
            errorMsg.response.json().then((str: ErrorOutput) => {
              this.$router.push("/");
              this.$toast(str.message, {
                styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
              });
            });
          });
  },
  data(): CbReturn {
    return{
    obj: undefined,
    twoFa: false,
    loading: true,
    email: "",
    vala: "",
    valr:"",
    code: ''
    }
  },
  methods: {
	async getMail()
	{
		const requestOptions = 
		{
			method: "POST",
			headers: 
			{
				'Accept': 'application/json',
				'Content-Type': 'application/json'
   			},
			body: JSON.stringify({ token: this.vala })
  		}
		await fetch(`http://${process.env.VUE_APP_IP}:3003/2fa/mail`, requestOptions)
		.catch(e => {
			this.$toast(e.message, {styles: { backgroundColor: "#FF0000", color: "#FFFFFF" }});
      this.$router.push("/");
		})
	},
    set_and_go : function()
    {
      setAccessCookie(this.vala);
      setRefreshCookie(this.valr);
      this.$store.dispatch('setCallbackWatcher');
      this.$store.dispatch('setAllSockets', this.vala);
      this.$router.push("/param")
      // window.location.reload();
    },
	async verify(twoFaCode: string): Promise<boolean>
	{
		let ret = false;
		const requestOptions = 
		{
			method: "POST",
			headers: 
			{
				'Accept': 'application/json',
				'Content-Type': 'application/json'
   			},
			body: JSON.stringify(
				{	
					token: this.vala,
					code: twoFaCode
				}
			)
  		}
		await fetch(`http://${process.env.VUE_APP_IP}:3003/2fa/verify`, requestOptions)
		.then(async response => { ret = response.ok })
		.catch(e => {
			this.$toast(e.message, {styles: { backgroundColor: "#FF0000", color: "#FFFFFF" }});
        	this.$router.push("/");
			return 0;
		})

		return (ret);
		
	},
    submit: async function()
    {
		let isVerified: boolean;
		isVerified = await this.verify(this.code);
		if (isVerified == true)
		{
			this.set_and_go();
		}
		else
		{
			this.$toast("Incorrect 2FA code", {styles: { backgroundColor: "#FF0000", color: "#FFFFFF" }});
        	this.$router.push("/");
		}
    }
  },
  components :{
    loadingPage
  }
});
</script>


<style src="@/assets/tailwind.css" />
