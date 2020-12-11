const Discord = require("discord.js");

module.exports = (client) => {
    console.log(`${client.user.username} est en ligne`);

    const activities = [
        "a!help | Avadia",
        `a!help | ?/100`,
    ];
      client.setInterval(() => {
        const index = Math.floor(Math.random() * activities.length);
            client.user.setActivity(activities[index], {
             type: "PLAYING",
              url: "http://twitch.tv/avadia"
          });
    }, 60000);
};

