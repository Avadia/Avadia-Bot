const Discord = require("discord.js");
let footerAuthor = '≻ Avadia';

module.exports.run = async(client, message, args, languageConfig) => {
    const helpembed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle("Help | Avadia 🌐")
        .setColor('#FF9701')
        .setFooter(footerAuthor, client.user.avatarURL)
        .setDescription("**≻ La liste des commandes :**")
        .addField(`🔰❱ Importantes`, "`link {minecraftUsername}`, `code {linkCode}`")
        .addField(`🎭❱ Utilitaires`, "`profil {minecraftUsername}`")
        .setTimestamp();
        
    message.channel.send(helpembed)
}

module.exports.help = {
    name: "help",
}
