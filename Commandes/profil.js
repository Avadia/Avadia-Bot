const Discord = require("discord.js");
const talkedRecently = new Set();

let footerAuthor = "≻ Avadia";

module.exports.run = async(client, message, args, redisClient, sqlconnection, sqlconnectionMC) => {

    if (talkedRecently.has(message.author.id)) {
        message.channel.send("Vous devez attendre **15 secondes** avant de faire la commande de nouveau !");
                  return;
      }
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 15000);

      if(!args[0]) return message.channel.send("Mauvaise usage de la commande ! ``a!profil {minecraftUsername}``")
      sqlconnectionMC.query(`SELECT HEX(uuid) as uuid, name, nickname, coins, stars, powders, last_login, first_login, last_ip, toptp_key, group_id, discord_id FROM players WHERE name = '${args[0]}'`, function (err, result, fields) {
        if (err) console.log(err);

        var protection = JSON.stringify(result).split('"')[3];
        if (!protection) return message.channel.send("Vous devez mettre le pseudo d'un joueur qui s'est déjà connecté !")

        var uuid1 = result[0].uuid;
        var uuid2 = uuid1.toLowerCase()
        var uuid = ""+uuid2[0]+uuid2[1]+uuid2[2]+uuid2[3]+uuid2[4]+uuid2[5]+uuid2[6]+uuid2[7]+"-"+uuid2[8]+uuid2[9]+uuid2[10]+uuid2[11]+"-"+uuid2[12]+uuid2[13]+uuid2[14]+uuid2[15]+"-"+uuid2[16]+uuid2[17]+uuid2[18]+uuid2[19]+"-"+uuid2[20]+uuid2[21]+uuid2[22]+uuid2[23]+uuid2[24]+uuid2[25]+uuid2[26]+uuid2[27]+uuid2[28]+uuid2[29]+uuid2[30]+uuid2[31];
        var name = result[0].name;
        var coins = result[0].coins;
        var stars = result[0].stars;
        var powders = result[0].powders;
        var last_login = result[0].last_login;
        var first_login = result[0].first_login;
        var group_id = result[0].group_id;
        var discord_id = result[0].discord_id

        sqlconnectionMC.query(`SELECT group_name FROM groups WHERE group_id = '${group_id}'`, function (err, result, fields) {
          if (err) console.log(err);
          var rank = JSON.stringify(result).split('"')[3];

        let profil = new Discord.MessageEmbed()
          .setTitle("📌 • __Profil de " + name + "__")
          .addField("📝 • __Discord ID__", discord_id, true)
          .addField("📑 • __UUID__", uuid + "", true)
          .addField("📌 • __Grade__", rank + "", true)
          .addField("👛 • __Pièces__", coins + "", true)
          .addField("🌟 • __Poussières d'étoiles__", powders + "", true)
          .addField("🎩 • __Dernière connexion__", last_login + "", true)
          .addField("🎂 • __Première connexion__", first_login + "", true)
          .setColor("#DD2E44")
          .setTimestamp()
          .setFooter(footerAuthor, client.user.avatarURL)

      client.channels.cache.get("655166840456347668").send(`[Mysql] Demande : ${uuid}, ${name}, ${coins}, ${stars}, ${powders}, ${last_login}, ${first_login}, ${group_id}, ${discord_id}`)
      console.log(`[Mysql] Demande : ${uuid}, ${name}, ${coins}, ${stars}, ${powders}, ${last_login}, ${first_login}, ${group_id}, ${discord_id}`)
      message.channel.send(profil)             
        })     
      })
        
}

module.exports.help = {
    name: "profil",
}