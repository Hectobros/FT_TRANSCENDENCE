const app = new Vue({
    el: '#app',
    data: 
    {
        title: 'Transcendance Testing Chat',
        name: '',
        text: '',
        messages: [],
        socket: null,
        channels: [],
        selected: 1,//"A" ,//this.channels[0].name,
        sender: "",
        text: "",
        chan_name: "",
        current_chan_id: 1,
    },
    methods: 
    {
        reloadPage() {
            window.location.reload();
        },
        onChange(event) 
        {
            this.current_chan_id = event.target.value;
            this.getMessages(this.current_chan_id);
        },
        getMessages(chanId)
        {
            this.messages = [];
            fetch(`http://127.0.0.1:3000/channel/${chanId}/messages`)
            .then((response) => response.json())
            .then((data) => {this.messages = [...data]});
        },
        getChannels()
        {
            this.channels = [];
            fetch('http://127.0.0.1:3000/channel')
            .then((response) => response.json())
            .then((data) => {this.channels = [...data]});
        },
        sendMessage() 
        {
            if(this.validateInput())
            {
                const message = {
                    // sender: this.sender,
                    text: this.text,
                    channelId: this.current_chan_id
                }
                this.socket.emit('msgToServer', message)
                this.text = '';
            }
        },
        createChan()
        {
            if (this.chan_name.length > 0)
            {
                const chan = {
                    name: this.chan_name,
                }
                this.socket.emit('chanToServer', chan);
                this.chan_name = '';
            }
        }
        ,
        receivedMessage(message) 
        {
            if (message.channelId === this.current_chan_id)
            {
                this.messages.push(message);
                var objDiv = document.getElementById("messages");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
           
        },

        receivedChannel(chan) 
        {
            this.channels.push(chan);
        },
        validateInput() 
        {
            return this.sender.length > 0 && this.text.length > 0
        }
    },
    created() 
    {
        this.getMessages(1);
        this.getChannels();
        this.socket = io(`http://127.0.0.1:3000`);
        this.socket.on(`msgToChannel`, (message) => {
            this.receivedMessage(message)
        })
        this.socket.on('chanToClient', (channel) => {
            this.receivedChannel(channel)
        })
    }
})
