<template>
<Teleport to="body">
<div className=" fixed  w-full h-screen top-0 bg-black bg-opacity-20">
    <div className="flex justify-center pt-24">
        <div className =" flex flex-col items-center bg-slate-100  shadow-xl w-1/2 pt-16 pl-16 pr-16 pb-8 rounded-xl">
            <span className = "pb-4" >{{ this.senderLogin }} veut se battre!</span>
            <RadialProgress 
                :diameter="100"
                :completed-steps="timerCount"
                :total-steps="totalSteps"
                :animate-speed="1000" startColor='#22C55E' >
                {{ timerCount }}
            </RadialProgress>
            <div className = "pt-16 flex flex-row justify-around items-end">
                <button @click="Accepted()" className = "transition ease-in-out delay-100 text-white hover:scale-110 rounded-xl pr-8 pt-4 pl-8 pb-4 mr-16 bg-green-500">Accept</button>
                <button @click="Declined()" className = "transition ease-in-out delay-100 text-white hover:scale-110 rounded-xl pr-8 pt-4 pl-8 pb-4 ml-16 bg-red-600">Decline</button>
            </div>
        </div>
    </div>
</div>
</Teleport>
</template>
  
<script>
import RadialProgress from "vue3-radial-progress";
  export default {
	name: 'modalVue',
    props : {
        isactive: {
            type: Function,
            required: true},
        senderLogin:  {
            type: String,
            required: true
        },
        gameCode: {
            type: String,
            required: true
        }
    },
    data()
    {
        return{
            timerCount: 10,
            totalSteps: 10,
        }
    },
    methods : {
        activate() {
            this.isactive();
        },
        Accepted() {
            const payload =
            {
                login: this.senderLogin,
                gameCode: this.gameCode,
                accepted: true
            }
            this.$store.state.globalSocket.emit('respondToInvitation', payload);
            this.isactive();
            this.$router.push('/home/' + this.gameCode);
        },
        Declined()
        {
            const payload =
            {
                login: this.senderLogin,
                gameCode: this.gameCode,
                accepted: false

            }
            if(this.senderLogin.length != 0  && this.gameCode.length != 0)
                this.$store.state.globalSocket.emit('respondToInvitation', payload);
            this.activate();
        },
    },
    components: {
        RadialProgress
    },
    watch: {
        timerCount: {
                handler(value) {

                    if (value >= 0) {
                        setTimeout(() => {
                            this.timerCount--;
                        }, 1000);
                    }
                    if (value == -1)
                    {
                        this.Declined();
                    }
                },
                immediate: true // This ensures the watcher is triggered upon creation
        }
    }
}
</script>
<style src="../assets/tailwind.css" />