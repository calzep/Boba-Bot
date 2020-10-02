const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const bounty = require("./bounty.js");
const config = require("./config.json");


const bountyRules =
`
*USE THIS CHANNEL AND ONLY THIS CHANNEL FOR BOUNTY HUNTING CHAT COMMANDS. DO NOT CHAT HERE!*

**Intro:** Welcome to Bounty Hunting. This is a new metagame created by Calzep. This game is played both in-game and here on discord. 

Every week up to 3 players will randomly have a bounty set on them. A bounty expires after 10 days (240 hours) and there will never be more than 5 active bounties at one time.
Player's who have a hit on them will be hunted by all other players and the player who kills them gets to redeem the hit and earn "gems" here on Discord. Bounties can be valued at anywhere between 1 and 20 gems.
Gems are currency here on Discord which you will be able to use to redeem "special perks". (To Be Announced)


**__IMPORTANT RULES:__**
1.) You do not have to tell somebody you are going to kill them, so if you have a bounty trust people at your own risk. 
2.) You also MUST chest the items of the person you kill so they can easily collect them again, you may not steal any of their items. 
3.) The player being hunted is not allowed to attack other players however they may run, hide, and even set traps.
`


const bountyCommands =
`
**__Bounty Commands:__**
**!bounty** - Display how many gems you have and enters the bounty game if you have not entered before.
**!bounty rules** - Displays introduction and rules.
**!bounty help** - Displays available commands.
**!hits/!hitlist** - Display the current hits/bounties.
**!redeem** [***@player***] - ONLY USE THIS COMMAND ONLY IF YOU ARE PAYING OFF YOUR OWN HIT OR HAVE PROOF OR A WITNESS THAT YOU HAVE COMPLETED A HIT. ABUSE WILL LEAD TO PENALTIES.
**!infamy** [optional: ***@player***] Display how much infamy you, or another player has.
**!bet** [***@player***] [***GEMS***] - Bet on who you think the next player to die will be. Bets are rewarded and reset when the next bounty is redeemed.
**!v/!ver/!version** - Displays the bot version, current changelog, and test environment status.
`;

/*
DEPRECATED COMMANDS:

!hit [@player] [BP] - Spend BP to set a hit/bounty on another player
*/

const changelog = 
`
2.0:
-refactored entire codebase
-new bounty gameplay rules
`

const changelogArchvie = 
`
1.2:
-added !bet command
-!redeem can now be used to pay off your own bounty
-fixed bugs
1.1:
-fixed bugs
-implemented !resetallbp for admin
-changed admin command !resetbounty to !resetbp and allows it to target other members
1.0:
-added !bounty help to view more info about the bounty game
-!bounty now refers a user to !bounty help
-!redeem will no longer allow you to redeem a bounty you purchased or a hit on yourself
-Added Infamy counter to bounty profile, Infamy is the sum of your kills and the amount of bounties placed on you
-Added !infamy command to check your infamy or the infamy of another @player
-Hit Data now saves the owner of the hit
-!hit will no longer work on someone who already has a hit placed by someone else
-Added !v/!ver/!version to detect the bot's version, changelog, and test environment status.
-!hits/!hitlist has been updated, reformatted, and will now display the username of the player who placed the hit
`




client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "test") {
	message.reply("Test completed at " + bounty.testTime());
    message.delete().catch(O_o=>{}); 
  }
  
  if(command === "redeem") {
    if(args[0].length > 0){
      var t = args[0];
      var target_nicknamed = t.slice(3,t.length-1);;
      var target = t.slice(2,t.length-1);
      if(message.mentions.users.has(target_nicknamed))
        await bounty.RedeemHit(message.author, target_nicknamed, message);
      else
        await bounty.RedeemHit(message.author, target, message);
    }
    message.delete().catch(O_o=>{}); 
  }

  if(command === "bet") {
    if(args[0] && args[0].length > 0){
      var t = args[0];
      var target_nicknamed = t.slice(3,t.length-1);;
      var target = t.slice(2,t.length-1);
      
      var amount = 0;

      if(args[1] && args[1].length > 0){
        try{
          amount = parseInt(args[1]);
        }catch {
          message.reply(" that is an invalid amount of GEMS.");
          return;
        }
        if(isNaN(amount)){
          message.reply(" that is an invalid amount of GEMS.");
          return;
        }
        if(message.mentions.users.has(target_nicknamed))
          await bounty.SetBet(target_nicknamed,amount,message.author,message);
        else if(message.mentions.users.has(target))
          await bounty.SetBet(target,amount,message.author,message);
        else if(args[1] && args[1].length > 0)
          message.reply("That user does not exist.");
      }else{
        message.reply('To use !bet you must specify a [@User] and an amount of [GEMS]. \nFor example: !bet @Calzep 20 \n(be sure to use a proper @mention.)');
      }
    }else{
      message.reply('To use !bet you must specify a [@User] and an amount of [GEMS]. \nFor example: !hit @Calzep 20 \n(be sure to use a proper @mention.)');
    }
    message.delete().catch(O_o=>{});     
  }
  /*
  if(command === "hit") {
    if(args[0] && args[0].length > 0){
      var t = args[0];
      var target_nicknamed = t.slice(3,t.length-1);;
      var target = t.slice(2,t.length-1);
      
      var amount = 0;

      if(args[1] && args[1].length > 0){
        try{
          amount = parseInt(args[1]);
        }catch {
          message.reply(" that is an invalid amount of BP.");
          return;
        }
        if(isNaN(amount)){
          message.reply(" that is an invalid amount of BP.");
          return;
        }
        if(message.mentions.users.has(target_nicknamed))
          await bounty.BuyHit(message.author,target_nicknamed,amount,message);
        else if(message.mentions.users.has(target))
          await bounty.BuyHit(message.author,target,amount,message);
        else if(args[1] && args[1].length > 0)
          message.reply("That user does not exist.");
      }else{
        message.reply('To use !hit you must specify a [@User] and a [BP_Amount]. \nFor example: !hit @Calzep 200 \n(be sure to use a proper @mention.)');
      }
    }else{
      message.reply('To use !hit you must specify a [@User] and a [BP_Amount]. \nFor example: !hit @Calzep 200 \n(be sure to use a proper @mention.)');
    }
    message.delete().catch(O_o=>{});     
  }
  */
  if(command === "bounty") {
    message.delete().catch(O_o=>{}); 
    if(!args[0] || (args[0] != 'help' && args[0] != 'rules')){
      await bounty.GetBounty(message.author,message);
      message.reply('you can type !bounty rules to view more info about the bounty game, and !bounty help to view the commands.');
    }else if(args[0] && args[0] == 'help'){
      message.channel.send(bountyCommands);
    }else if(args[0] && args[0] == 'rules'){
      message.channel.send(bountyRules);
    }
  }
  if(command === "infamy") {
    if(args[0] && args[0].length > 0){
      var t = args[0];
      var target_nicknamed = t.slice(3,t.length-1);;
      var target = t.slice(2,t.length-1);
      if(message.mentions.users.has(target_nicknamed))
        await bounty.GetInfamy(target_nicknamed,message);
      else if(message.mentions.users.has(target))
        await bounty.GetInfamy(target,message);
      else
        message.reply("That user does not exist.");
    }else{
      await bounty.GetInfamy(message.author,message);
    }
    message.delete().catch(O_o=>{}); 
    
  }
  if(command === "randbounty") {
    message.delete().catch(O_o=>{}); 
    if(!message.member.roles.cache.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    await bounty.SetRandomBounty(message);
  }
  if(command === "resetbp") {
    if(!message.member.roles.cache.some(r=>["Admin"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    if(args[0] && args[0].length > 0){
      var t = args[0];
      var target_nicknamed = t.slice(3,t.length-1);;
      var target = t.slice(2,t.length-1);
      if(message.mentions.users.has(target_nicknamed))
        await bounty.ResetBP(target_nicknamed,message);
      else if(message.mentions.users.has(target))
        await bounty.ResetBP(target,message);
      else
        message.reply("That user does not exist.");
    }else{
      await bounty.ResetBP(message.author,message);
    }
    message.delete().catch(O_o=>{});
  }
  if(command === "resetallpb") {
    message.delete().catch(O_o=>{}); 
    if(!message.member.roles.cache.some(r=>["Admin"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    await bounty.ResetAllBP(message);
  }
  if(command === "hits" || command === "hitlist") {
    message.delete().catch(O_o=>{}); 
    await bounty.GetHits(message);
  }

  if(command === "v" || command === "ver" || command === "version") {
    await message.reply('```'+ 'I am BobaBot v'+config.botVer+
                        '. \n\nLatest Changes:\n'+changelog+
                        '\n\nIsTestEnvironment: '+config.testMode+'```');
  }

  if(command === "say") {
    if(!message.member.roles.cache.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }

  if(command === "resetactive") {
    if(!message.member.roles.cache.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    message.delete().catch(O_o=>{});
    
    let activeMembers = message.guild.members.cache.filter(member => { 
        return member.roles.cache.find(role => role.name, "[Active]");
    }).map(member => {
        return member;
    })
    let msg = ''
    let numOfUsersReset = 0;
    console.log(message.guild.roles.cache.get("698826040612749372").name);
    console.log(activeMembers.length);
    for (i = 0 ; activeMembers.length > i ; i++){
      await activeMembers[i].roles.remove("698826040612749372");
      let uName = activeMembers[i].user.username;
      msg = msg + `User: ${uName} has been reset\n`;
      numOfUsersReset++;
    }
    if(numOfUsersReset > 0){
      message.reply(msg);
      message.reply("All active members have had their roles reset, please go re-react to mark yourself active again.")
    }
  }


  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.cache.some(r=>["Admin", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.cache.some(r=>["Admin"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
});

client.login(config.token);
