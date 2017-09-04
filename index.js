// https://discordapp.com/api/oauth2/authorize?client_id=352554223029846017&scope=bot&permissions=0


const Discord = require('discord.js');
const rbx = require('roblox-js')
const Config = require("./config.json");
const Mutes = require("./mutes.json");
const vMutes = require("./vmutes.json");
const History  = require("./history.json");
const fs = require('fs');

var bot = new Discord.Client();
var commands_ = new Array
bot.Commands = new Discord.Collection();
bot.mutes = Mutes
bot.vmutes = vMutes
bot.history = History
bot.Command_String = new String

const Responses = {
    "owo":"what's this?",
    "oof":"https://www.youtube.com/watch?v=MUcIG4VnzaI",
    "Is Bandit the sex man?":"Of course.",
    "nigger":"hey dats racist",
    "my dog died like if you agree":":thumbsup::skin-tone-3:"
}

fs.readdir("./cmds/", (err, files) => {
  if (err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0) {
    console.log("No commands to load!")
    return;
  }

  console.log(`Loading ${jsfiles.length} commands!`)

  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}` );
    bot.Commands.set(props.help.name, props);
    commands_.push({name:props.help.name, usage:props.help.usage, description:props.help.description, admin_only:props.options.admin_only})
  });
})

function joinArray(args, start) {
    var string = new String
    for (i = 0; i < args.length-start; i++) {
        string = string + " " + args[i+start]
    }
    return string;
}

bot.on('ready', function (message) {
    bot.user.setPresence({ game: { name: Config.GAME_PRESENCE, type: 0 } });
    bot.user.setPresence({status:"dnd"})
    bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.btlogs).send(`\`${bot.user.username}\` is ready.\n Presence set to \`${Config.GAME_PRESENCE}\``)
    console.log('Ready');

    let fr_message = `**Prefix:** \`${Config.PREFIX}\` -- Use this to execute commands\n`
    let command_list = []
    for (i = 0; i < commands_.length; i++) {
        let command_ = commands_[i], name = command_.name, usage = command_.usage, description = command_.usage, admin_only = command_.admin_only

        let r_message = `**${command_.name}:** \`${command_.usage}\` -- ${command_.description}. **Admin Only:** \`${admin_only}\` \n`
        command_list.push(r_message)
    }
    let f_message = joinArray(command_list, 0)
    let final_message = fr_message + f_message
    bot.Command_String = final_message

    bot.setInterval(() => {
      for (let i in bot.mutes) {
        let time = bot.mutes[i].time
        let guildId = bot.mutes[i].guild
        let reason = bot.mutes[i].reason
        let guild = bot.guilds.get(guildId);
        let member = guild.members.get(i)
        let mutedRole = guild.roles.find(r => r.name === "Muted")
        let embed = new Discord.RichEmbed()
            .setTitle("You have been unmuted on Duckmitri's Discord Server")
            .setDescription("Welcome back.")
            .setColor("#64FF64")

        if (Date.now() > time) {
          member.removeRole(mutedRole);
          member.send({embed:embed})
          delete bot.mutes[i];

          fs.writeFile("./mutes.json", JSON.stringify(bot.mutes), err => {
            if (err) throw err;
          })
        }
      }
    }, 5000)

    bot.setInterval(() => {
        for (let i in bot.vmutes) {
          let time = bot.vmutes[i].time
          let guildId = bot.vmutes[i].guild
          let reason = bot.vmutes[i].reason
          let guild = bot.guilds.get(guildId);
          let member = guild.members.get(i)
          let mutedRole = guild.roles.find(r => r.name === "Muted")
          let embed = new Discord.RichEmbed()
              .setTitle("You have been unmuted on Duckmitri's Discord Server")
              .setDescription("Welcome back.")
              .setColor("#64FF64")
  
          if (Date.now() > time) {
            //member.serverMute(false)
            member.send({embed:embed})
            delete bot.vmutes[i];
  
            fs.writeFile("./mutes.json", JSON.stringify(bot.vmutes), err => {
              if (err) throw err;
            })
          }
        }
      }, 5000)
});

const TOKEN = Config.TOKEN;
const PREFIX = Config.PREFIX;

bot.on('voiceStateUpdate', function(new_m, old_m) {
    if (new_m.voiceChannel && !old_m.voiceChannel) {
        bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.vlogs).send(`**${new_m.user.username} left \`${new_m.voiceChannel.name}\`**`)
    } else if (!new_m.voiceChannel && old_m.voiceChannel) {
        bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.vlogs).send(`**${new_m.user.username} joined \`${old_m.voiceChannel.name}\`**`)
    } else if (new_m.voiceChannel && old_m.voiceChannel) {
        bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.vlogs).send(`**${new_m.user.username} switched to \`${new_m.voiceChannel.name}\` from \`${old_m.voiceChannel.name}\`**`)
    } else {
        bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.vlogs).send("**Unknown functions**")
    }
})


bot.on('messageDelete', message => {
    var channel = bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.clogs)
    var embed = new Discord.RichEmbed({
        "title": "Message Deleted",
        "description": "",
        "color": 16724530,
        "fields": [
            {
                "name": "User",
                "value": `<@${message.author.id}>`,
                "inline": true,
                },
              {
                "name": "Channel",
                "value": `<#${message.channel.id}>`,
                "inline": true,
              },
              {
                "name": "Message",
                "value": `\`\`\`${message.content}\`\`\``,
                "inline": false,
              },
            ]
        })
    channel.send({"embed":embed})
})

bot.on("messageReactionAdd", function(messageReaction, user) {
    var reactionUsers = messageReaction.fetchUsers();
    if (messageReaction.emoji.id === "353340387147907074") {
        console.log("Mute registered.")
        for (i = 0; i < reactionUsers.length; i++) {
            if (reactionUsers[i].member.roles.some(r=>["best friends", "duck"].includes(r.name))) {
                let cmd = bot.Commands.get("mute");
                cmd.run(bot, messageReaction.message, ["mute",messageReaction.message.member.id,"30",`Inappropriate\n\`\`\`${messageReaction.message.content}\`\`\``])
            }
        }
    }
})

bot.on('guildMemberAdd', member => {
    console.log(`${member.user.username} has joined the server`)
    member.addRole(member.guild.roles.find('name','Newbies'))
    member.send("Welcome to Duckmitri's server. Please read the rules in <#322947792420995084>. Any extra information please DM a moderator.")
    bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.jlogs).send(`<@${member.user.id}>** has joined the server.**`)
})

bot.on('guildMemberRemove', member => {
    console.log(`${member.user.username} has left the server`)
    bot.guilds.find("id", Config.LOGS_SERVER).channels.find("id", Config.LOGS_CHANNELS.jlogs).send(`<@${member.user.id}>** has left the server.**`)
})

bot.on('message', function(message) { // Admin Commands
    if (message.author.equals(bot.user)) return;

    if (Responses[message.content.toLowerCase()]) {
        message.channel.send(Responses[message.content.toLowerCase()]);
        return;
    }

    if (!message.content.startsWith(PREFIX)) return;
    if (message.channel.type === "dm") {
        message.channel.send("Sorry, I don't support DM commands yet.");
        return;
    }
    if(!message.guild.id === Config.MAIN_SERVER) {
        message.reply("Commands may only be executed in Duckmitri's Discord. DM <@187750747008401408> for the link.")
    }

    let messageArray = message.content.split(/\s+/g);
    let command = messageArray[0];
    let args = messageArray.slice();

    let cmd = bot.Commands.get(command.slice(Config.PREFIX.length));

    if (command === ";help") {
        message.author.send(bot.Command_String)
        message.react(Config.EMOJIS.Yes);
    }

    

    if (cmd) {
      if (cmd.options.admin_only === true) {
        if (!message.member.roles.some(r=>Config.ADMIN_RANKS.includes(r.name))) {
          message.channel.reply("You do not have the permissions to execute this command.");
          message.delete()
        } else {
            cmd.run(bot, message, args)
            if (!message.channel.id === Config.MAIN_CHANNELS.staffcommands) {
                message.delete()
            }
        }
      } else {
        cmd.run(bot, message, args)
      }
    };


    /*
    switch (args[0].toLowerCase()) {
        case "rundiag":
            message.channel.send("Test successful!");
            message.react(Emojis.Yes);
            break;

        case "help":
            if (Command_channel) {
                for (i = 0; i < Help_Message.length; i++) {
                    message.channel.send(message.author + "\n" + Help_Message[i]);
                }
            } else {
                for (i = 0; i < Help_Message.length; i++) {
                    message.member.send(message.author + "\n" + Help_Message[i]);
                }
            };
            message.react(Emojis.Yes);
            break;

        case "kick":
            var member = message.guild.members.find("id", args[1])
            if (member) {
                if (member.kickable === false) {
                    message.react(Emojis.No)
                    message.channel.send(message.author + "\n Sorry, this user is not kickable.");
                    return;
                } else {
                    var embed = new Discord.RichEmbed({
                          "title": "You've been kicked from Duckmitri's Server",
                          "description": joinArray(args, 2),
                          "color": 16724530,
                          "footer": {
                            "text": "If you feel this was unfair, please DM a moderator."
                          },
                      })
                      var embed_l = new Discord.RichEmbed({
                        "title": "User has been kicked",
                        "description": "Information",
                        "color": 16724530,
                        /*"footer": {
                          "text": "If you feel this was unfair, please DM a moderator."
                        },
                        "fields": [
                        {
                            "name": "User",
                            "value": "<@"+member.user.id+">",
                            "inline": true,
                            },
                          {
                            "name": "Moderator",
                            "value": "<@"+message.author.id+">",
                            "inline": true,
                          },
                          {
                            "name": "Reason",
                            "value": joinArray(args, 2),
                            "inline": true,
                          },
                        ]
                    })
                    var channel = bot.guilds.find("id", LOGS_SERVER).channels.find("id", LOGS_CHANNELS.klogs)
                    channel.send({"embed":embed_l});
                    member.send({"embed":embed})
                    message.react(Emojis.Yes);
                    member.kick(joinArray(args, 2))
                }
            } else {
                message.react(Emojis.No);
                message.channel.send(message.author + Invalid_Message)
            }
            break;

        case "ban":
           var member = message.guild.members.find("id", args[1])
            if (member) {
            if (member.bannable === false) {
                message.react(Emojis.No)
                message.channel.send(message.author + "\n Sorry, this user is not banneable.");
                return;
            } else {
                var embed = new Discord.RichEmbed({
                      "title": "You've been banned from Duckmitri's Server",
                      "description": joinArray(args, 2),
                      "color": 16724530,
                      "footer": {
                        "text": "If you feel this was unfair, please DM a moderator."
                      },
                  })
                  var embed_l = new Discord.RichEmbed({
                    "title": "User has been banned",
                    "description": "Information",
                    "color": 16724530,
                    "footer": {
                      "text": "If you feel this was unfair, please DM a moderator."
                    },
                    "fields": [
                    {
                        "name": "User",
                        "value": "<@"+member.user.id+">",
                        "inline": true,
                        },
                      {
                        "name": "Moderator",
                        "value": "<@"+message.author.id+">",
                        "inline": true,
                      },
                      {
                        "name": "Reason",
                        "value": joinArray(args, 2),
                        "inline": true,
                      },
                    ]
                })
                var channel = bot.guilds.find("id", LOGS_SERVER).channels.find("id", LOGS_CHANNELS.blogs)
                channel.send({"embed":embed_l});
                member.send({"embed":embed})
                message.react(Emojis.Yes);
                member.ban()
            }
        } else {
            message.react(Emojis.No);
            message.channel.send(message.author + Invalid_Message)
        }
        break;

        case "announce":
            var channel = message.guild.channels.find("id", MAIN_CHANNELS.announcments)
            if (channel) {
                var argsTogether = joinArray(args,1)
                try {
                    channel.send(argsTogether);
                }
                catch(err) {
                    var embed = new Discord.RichEmbed({
                        "title": "An error has occured",
                        "description": "`"+err+"`",
                        "color": 16724530,
                    })
                    message.channel.send({"embed":embed})
                }
                message.react(Emoji.Yes);
            } else {
                var embed = new Discord.RichEmbed({
                    "title": "An error has occured",
                    "description": "`Invalid Channel`",
                    "color": 16724530,
                })
                message.channel.send({"embed":embed})
                message.react(Emojis.No);
            }
            break;

        case "mute":
            var member = message.guild.members.find("id", args[1])
            if (member) {
                var channel = bot.guilds.find("id", LOGS_SERVER).channels.find("id", LOGS_CHANNELS.mlogs)
                var reason =  joinArray(args,2);
                Mute(member, message, reason)
            }
        break;

        case "unmute":
        var member = message.guild.members.find("id", args[1])
        if (member) {
            Unmute(member, message)
        }
        break;

        default:
            message.react(Emojis.No);
            break;
    }*/
});

bot.login(TOKEN);