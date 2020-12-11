const Discord = require("discord.js");
const talkedRecently = new Set();

module.exports.run = async(client, message, args, redisClient, sqlconnection, sqlconnectionMC) => {

    if (talkedRecently.has(message.author.id)) {
        message.channel.send("Vous devez attendre **1 minute** avant de faire la commande de nouveau !");
                  return;
      }
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      },1);

            let code = args[0]
            if(!code) return message.channel.send("Mauvaise usage de la commande ! ``a!code {code}``")

            sqlconnection.query(`SELECT unverifiedPseudo FROM users WHERE discord_userid = '${message.author.id}'`, function (err, result, fields) {
                if (err) console.log(err);

                var unverifiedPseudo = JSON.stringify(result).split('"')[3];
                if(!unverifiedPseudo) return message.channel.send("Merci de faire `a!link {pseudo}` avant de faire la commande.")

                client.channels.cache.get("655166840456347668").send(`[Mysql] Demande: ${unverifiedPseudo}`)
                console.log(`[Mysql] Demande: ${unverifiedPseudo}`)

                sqlconnection.query(`SELECT randomCode FROM users WHERE discord_userid = '${message.author.id}'`, function (err, result, fields) {
                    if (err) console.log(err);

                    var randomCode = JSON.stringify(result).split('"')[3];
                    if(!randomCode) return message.channel.send("Merci de faire `a!link {pseudo}` avant de faire la commande.")
                    if(code !== randomCode ) return message.channel.send("Le code est malheureusement invalide :(")

                    client.channels.cache.get("655166840456347668").send(`[Mysql] Demande: ${randomCode}`)
                    console.log(`[Mysql] Demande: ${randomCode}`)

                    sqlconnection.query(`UPDATE users SET pseudo_link = \"${unverifiedPseudo}\" WHERE discord_userid = \"${message.author.id}\"`, function (err, result, fields) { 
                        if (err) console.log(err);

                        client.channels.cache.get("655166840456347668").send(`[Mysql] Update du tableau de : ${message.author.tag}`)
                        console.log(`[Mysql] Update du tableau de : ${message.author.tag}`)

                        sqlconnectionMC.query(`SELECT HEX(uuid) as uuid FROM players WHERE name = '${unverifiedPseudo}'`, function (err, result, fields) { 
                            if (err) console.log(err);
    
                        var uuid1 = JSON.stringify(result).split('"')[3];
                        if (!uuid1) return message.channel.send("Le pseudo n'est pas dans notre base de donnée.")
    
                        var uuid2 = uuid1.toLowerCase()
                        var uuid = ""+uuid2[0]+uuid2[1]+uuid2[2]+uuid2[3]+uuid2[4]+uuid2[5]+uuid2[6]+uuid2[7]+"-"+uuid2[8]+uuid2[9]+uuid2[10]+uuid2[11]+"-"+uuid2[12]+uuid2[13]+uuid2[14]+uuid2[15]+"-"+uuid2[16]+uuid2[17]+uuid2[18]+uuid2[19]+"-"+uuid2[20]+uuid2[21]+uuid2[22]+uuid2[23]+uuid2[24]+uuid2[25]+uuid2[26]+uuid2[27]+uuid2[28]+uuid2[29]+uuid2[30]+uuid2[31];

                        client.channels.cache.get("655166840456347668").send(`[Mysql] Demande: ${uuid}`)
                        console.log(`[Mysql] Demande: ${uuid}`)

                        sqlconnectionMC.query(`UPDATE players SET discord_id = \"${message.author.id}\" WHERE uuid = UNHEX(\"${uuid2}\")`, function (err, result, fields) { 
                            if (err) console.log(err);


                            client.channels.cache.get("655166840456347668").send(`[Mysql] Update du tableau de : ${unverifiedPseudo}`)
                            console.log(`[Mysql] Update du tableau de : ${unverifiedPseudo}`)

                        message.channel.send(`Vous avez été link avec succès sous le pseudo **${unverifiedPseudo}** ! (${uuid})`)
                        redisClient.publish("apiexec.send", uuid + " {\"text\":\"" + `§3[§bDiscord§3]§7 Vous avez été verifier avec succès sous le pseudo de : §f${message.author.tag} §7!` + "\"}");

                        client.channels.cache.get("655166840456347668").send(`[Redis] **${message.author.tag}**/**${unverifiedPseudo}** a bien reçu la confirmation de vérification.`)
                        console.log(`[Redis] **${message.author.tag}**/**${unverifiedPseudo}** a bien reçu la confirmation de vérification.`)

                        sqlconnection.query(`UPDATE users SET randomCode = "" WHERE discord_userid = \"${message.author.id}\"`, function (err, result, fields) {
                            
                            if (err) console.log(err); 
                        })

                        })
                        })
                    })
                })
            })

}

module.exports.help = {
    name: "code",
}