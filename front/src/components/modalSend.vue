<template>
    <Teleport to="body">
    <div v-if="loading">
    <div v-show="ison" className=" fixed  w-full h-full bg-black bg-opacity-20">
        <div className="flex justify-center pt-24">
            <div className =" flex flex-col items-center bg-slate-100  shadow-xl w-1/2 pt-16 pl-16 pr-16 pb-8 rounded-xl">
                <span className = "pb-4">Vous avez demandé un 1V1 contre BOBY</span>
                <Countdown :deadlineDate="date" :showDays=false :showHours=false :showMinutes=false mainColor='#22C55E' />
                <div className = "pt-16 flex flex-row justify-around items-end">
                    <button @click="activate()" className = "transition ease-in-out delay-100 text-white hover:scale-110 rounded-xl pr-16 pt-4 pl-16 pb-4 bg-red-500">CANCEL</button>
                </div>
            </div>
        </div>
    </div>
    </div>
    </Teleport>
</template>
      
<script>
import {Countdown} from 'vue3-flip-countdown'
export default {
    name: 'modalVue',
    props : {
        isactive: {type: Function,
            required: true},
        ison: {
            type : Boolean,
            default: false
        }
    },
    methods : {
        activate() {
            this.isactive();
        },
        async autovalidate () {
            await this.delay(20000);
            this.isactive();
        },
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },
    data()
    {
        return{
            date:Date,
            loading : false
        }
    },
    components: {
        Countdown
    },
    watch: {
        ison: async function(newVal, oldVal)
        {
            if (newVal == true)
            {
                let date = new Date();
                date.setSeconds(date.getSeconds() + 20);
                this.date = date;
                this.loading = true;
                this.autovalidate();
            }
            if (oldVal == true)
            {
                this.loading = false;
            }
        },
    }
}
</script>

<style src="../assets/tailwind.css" />