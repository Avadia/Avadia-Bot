const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const fs = require('fs');

const mysqlConfig = require('./mysql.json');
const mysql = require("mysql2")

const redis = require("redis");
const { request } = require('http');
const redisClient = redis.createClient();

//////////Optimisation//////////
function logs(message) {
  client.channels.cache.get("655166840456347668").send(message)
  console.log(message)
}

//////////Charge les commandes//////////
fs.readdir('./Commandes/', (error, f) => {
    if (error) { return console.error(error); }
    let commandes = f.filter(f => f.split('.').pop() === 'js');
    if (commandes.length <= 0) { return console.log('Aucune commande trouvée !'); }

    commandes.forEach((f) => {
        let commande = require(`./Commandes/${f}`);
        console.log(`${f} commande chargée !`);
        client.commands.set(commande.help.name, commande);
    });
});

/////////////Charge les events/////////////

fs.readdir('./Events/', (error, f) => {
    if (error) { return console.error(error); }
    console.log(`${f.length} events chargés`);

    f.forEach((f) => {
        let events = require(`./Events/${f}`);
        let event = f.split('.')[0];
        client.on(event, events.bind(null, client));
    });
});
//////////Auto Voice Channels//////////

client.on('voiceStateUpdate', (oldMember, newMember) => {
  var guild = client.guilds.cache.get("543838011096563733");

  let newUserChannel = newMember.channelID
  let newChannelInfo = client.channels.cache.get(newUserChannel)

  if(newChannelInfo){
    let newChannelName = newChannelInfo.name
    let newChannelNumber = newChannelName.split("#")[1]

    let voiceChannel = client.channels.cache.find(x => x.name === newChannelName)





    //staff
    if(newChannelName.startsWith("🎎 »")){
      filterInt = function (value) {
        if (/^(-|\+)?(\d+|Infinity)$/.test(value))
          return Number(value);
        return NaN;
      }
      let createChannelName = `🎎 » Discussion Staff #`+`${filterInt(newChannelNumber)+1}`
      let voiceChannel = client.channels.cache.find(x => x.name === createChannelName)

      if(!voiceChannel){
      guild.channels.create(createChannelName, { type: 'voice', 
      permissionOverwrites: [{
        id: guild.id,
        deny: ['VIEW_CHANNEL'],
        allow: ['CONNECT'] }]}).then( 
        (chan) => {
            chan.setParent("655163421448470563")
          })    
        }
      }

      //joueur channel temporaire
      if(newChannelName.startsWith("[🏡]")){
        let member = guild.members.cache.get(newMember.id)
        let createChannelName = `🔊 » Maison de `+`${member.user.username} [${member.user.id}]`
        let voiceChannel = client.channels.cache.find(x => x.name === createChannelName)

        if(!voiceChannel){
          guild.channels.create(createChannelName, { type: 'voice', 
          permissionOverwrites: [{
            id: guild.id,
            allow: ['CONNECT'] }]}).then( 
            (chan) => {
                chan.setParent("754035694258880613")
                member.voice.setChannel(chan)
                chan.overwritePermissions([
                  {
                     id: member.user.id,
                     allow: ['MUTE_MEMBERS', 'DEAFEN_MEMBERS'],
                  },
                ], '[Avadia-Maison] Update');
            })    
        }

      }
  }
  let oldUserChannel = oldMember.channelID
  let oldChannelInfo = client.channels.cache.get(oldUserChannel)

  if(oldChannelInfo){
    let oldChannelName = oldChannelInfo.name
    let oldChannelNumber = oldChannelName.split("#")[1]

    //staff
    if(oldChannelName.startsWith("🎎 »")){
      if(oldChannelInfo.members.size === 0){
        if (oldChannelNumber > 1){
          oldChannelInfo.delete()
        }else{
          return false;
        }
      }
    }
      //joueur channel temporaire
      if(oldChannelName.startsWith("🔊 » Maison de ")){
        if(oldChannelInfo.members.size === 0){
          oldChannelInfo.delete()
        }else{
          return false;
        }
      }

  }
})
/////////////Mysql/////////////

const sqlconnection = mysql.createConnection({
  host: mysqlConfig.mysql_host,
  user: mysqlConfig.mysql_user,
  password: mysqlConfig.mysql_password,
  database: mysqlConfig.mysql_db
});

var token = "";

sqlconnection.connect(function (err) {

  if (err) throw err;

  console.log("connection avec mysql réussite");

  sqlconnection.query("SELECT token FROM bots", function (err, result, fields) {

    if (err) console.log(err);

    token = result[0].token

    client.login(token); //login du bot
  })
});

/////////////Redis/////////////

const subscriber = redis.createClient();
const publisher = redis.createClient();

subscriber.on("message", function (channel, message) {
  logs("[Redis] J'ai reçu une requête dans le channel '" + channel + "': " + message)

  var args = message.split("/")
  var content = args[2].split(":");

  var requestMove = message.split("/")

  var guild = client.guilds.cache.get("543838011096563733");

  if (content[0] === "createchannel") {
    guild.channels.create(content[1], {
      type: 'voice',
      permissionOverwrites: [{
        id: guild.id,
        deny: ['VIEW_CHANNEL'],
        allow: ['CONNECT']
      }]
    }).then((chan) => {
        chan.setParent("750389798652477542")
        logs(`[Avadia] Un salon de jeu du nom de **${content[1]}** a été ajouter !`)

        publisher.publish("discordbot.response", `${args[0]}/${args[1]}/${chan.id}`)
        logs(`[Redis] J'ai bien envoyé la requête ${args[0]}/${args[1]}/${chan.id} dans discordbot.response.`)
      })
  } else if (content[0] === "deletechannel") {
    console.log(message.split(":")[1])
    const deleteChannel = client.channels.cache.get(message.split(":")[1])
    console.log(deleteChannel)
          //client.channels.cache.find(x => x.name === requestMove[0])
      deleteChannel.delete()
        .catch(console.error);
    logs(`[Avadia] Le salon de jeu du nom de **${requestMove[0]}** a été enlever !`)

    publisher.publish("discordbot.response", `${args[0]}/${args[1]}/true`)
    logs(`[Redis] J'ai bien envoyé la requête ${args[0]}/${args[1]}/true dans discordbot.response.`)

  } else if (content[0] === "isconnected") {
    var uuid1 = content[1]
    var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
    sqlconnection.query(`SELECT discord_userid FROM users WHERE uuid = ${uuidMysql}`, function (err, result, fields) {
      var id = result
      if (!id) {
        return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
      }else{
         var discid = JSON.stringify(id).split('"')[3];;
         var member = guild.members.cache.get(discid)
         // var member = guild.members.fetch(discid);
         console.log(member)
            if(member.voice){
            publisher.publish("discordbot.response", `${args[0]}/${args[1]}/true`);
            return logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/true`)                
         }else{
                         console.log("error chez le else")
            logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          	return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);               
         }       
	
   		 /*if(member.voice === undefined || member.voice === null){
           logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          	return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
         }else{
            publisher.publish("discordbot.response", `${args[0]}/${args[1]}/true`);
            logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/true`)
         }  */
      }
    })
  } else if (content[0] === "move") {
    var uuid1 = content[2]
    var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
    sqlconnection.query(`SELECT discord_userid FROM users WHERE uuid = ${uuidMysql}`, function (err, result, fields) {
      var id = result[0].discord_userid
      var member = guild.members.cache.get(id)
      let voiceChannel = client.channels.cache.get(message.split(":")[1])
      message.split(":")
      member.voice.setChannel(voiceChannel.id).catch(error => {
        console.log(" " + error)
        if (error) {
          logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
        }
      })
      var uuid1 = content[2]
      var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
      var uuid = uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];

      publisher.publish("discordbot.response", `${args[0]}/${args[1]}/${uuid}`);
      logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/${uuid}`)
    })
  } else if (content[0] === "mute") {
    var uuid1 = content[1]
    var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
    sqlconnection.query(`SELECT discord_userid FROM users WHERE uuid = ${uuidMysql}`, function (err, result, fields) {
      var id = result[0].discord_userid
      var member = guild.members.cache.get(id)

      member.voice.setMute(true).catch(error => {
        console.log(" " + error)
        if (error) {
          logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
        }
      })
      var uuid1 = content[1]
      var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
      var uuid = uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];

      publisher.publish("discordbot.response", `${args[0]}/${args[1]}/${uuid}`);
      logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/${uuid}`)
    })
  } else if (content[0] === "unmute") {
    var uuid1 = content[1]
    var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
    sqlconnection.query(`SELECT discord_userid FROM users WHERE uuid = ${uuidMysql}`, function (err, result, fields) {
      var id = result[0].discord_userid
      var member = guild.members.cache.get(id)

      member.voice.setMute(false).catch(error => {
        console.log(" " + error)
        if (error) {
          logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
        }
      })
      var uuid1 = content[1]
      var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
      var uuid = uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];

      publisher.publish("discordbot.response", `${args[0]}/${args[1]}/${uuid}`);
      logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/${uuid}`)
    })
  } else if (content[0] === "kick") {
    var uuid1 = content[1]
    var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
    sqlconnection.query(`SELECT discord_userid FROM users WHERE uuid = ${uuidMysql}`, function (err, result, fields) {
      var id = result[0].discord_userid
      var member = guild.members.cache.get(id)

      member.voice.setChannel("750390165679112342").catch(error => {
        console.log(" " + error)
        if (error) {
          logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/ERROR`)
          return publisher.publish("discordbot.response", `${args[0]}/${args[1]}/ERROR`);
        }
      })
      var uuid1 = content[1]
      var uuidMysql = "0x" + uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];
      var uuid = uuid1.split("-")[0] + uuid1.split("-")[1] + uuid1.split("-")[2] + uuid1.split("-")[3] + uuid1.split("-")[4];

      publisher.publish("discordbot.response", `${args[0]}/${args[1]}/${uuid}`);
      logs("[Redis] J'ai envoyé une requête dans le salon '" + channel + "': " + `${args[0]}/${args[1]}/${uuid}`)
    })
  }
});

subscriber.subscribe("discordbot");