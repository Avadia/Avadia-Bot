const Discord = require('discord.js');
const prefix = 'a!';

const redis = require("redis");
const redisClient = redis.createClient();

const mysql = require("mysql2")
const mysqlConfig = require('../mysql.json');
const sqlconnection = mysql.createConnection({
    host: mysqlConfig.mysql_host,
    user: mysqlConfig.mysql_user,
    password: mysqlConfig.mysql_password,
    database: mysqlConfig.mysql_db
  });
  const sqlconnectionMC = mysql.createConnection({
    host: mysqlConfig.mysql_host1,
    port: mysqlConfig.mysql_port1,  
    user: mysqlConfig.mysql_user1,
    password: mysqlConfig.mysql_password1,
    database: mysqlConfig.mysql_db1
  });

module.exports = (client, message) => {
    //discord
    if (message.author.bot || message.channel.type === 'dm') { return; }
    if (!message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) { return; }
    if (!message.content.startsWith(prefix)) { return; }

        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let commande = args.shift();
        let cmd = client.commands.get(commande);
    //redis
        redisClient.set("key", "value", redis.print);
        redisClient.get("key", redis.print);

        redisClient.on("error", function(error) {
            console.error(error);
          });
    //mysql
    sqlconnection.query("SELECT * FROM `users` WHERE discord_userid = "+message.author.id, function (err, result, fields) {      
        if (err) console.log(err);

        if (result.length === 0) {
            sqlconnection.query(`INSERT INTO users (discord_userid) VALUES ("${message.author.id}")`, function (err, result, fields) { 

                client.channels.cache.get("655166840456347668").send(`[Mysql] ajout de ${message.author.id} dans la base de donnée.`)
                console.log(`[Mysql] ajout de ${message.author.id} dans la base de donnée.`)

                message.channel.send("**[**Avadia_DB**]** Vous n'êtes pas dans notre base de donnée ! Nous allons vous ajoutez à notre base de donnée.")

            })
        }else{
            client.channels.cache.get("655166840456347668").send(`[Mysql] ${message.author.tag} OK !`)
            console.log(`[Mysql] ${message.author.tag} OK !`)

        }
    })

      
        if (!cmd) { return; }
            cmd.run(client, message, args, redisClient, sqlconnection, sqlconnectionMC);
};