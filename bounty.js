const Discord = require('discord.js');
const fs = require('fs');
const config = require("./config.json");
// Bounty Functions ---------------------
module.exports = {
	testTime, RedeemHit, SetBet, GetBounty, GetInfamy, SetRandomBounty, ResetBP, ResetAllBP, GetHits
}

function testTime(){
	return new Date();
}


function CreateNewBountyProfile(playerID){
  fs.appendFileSync(__dirname+'/bounty/'+playerID+'.txt', '1-0-0', 'utf8');
  console.log('New Bounty Profile Created!');
  return LoadExistingBountyProfile(playerID);
}
function LoadExistingBountyProfile(playerID){
  var data = fs.readFileSync(__dirname+'/bounty/'+playerID+'.txt','utf8').split('-'); 
  if(!data[1])
    data[1] = 0;
  if(!data[2])
    data[2] = 0;
  var bountyProfile = [playerID,parseInt(data[0]),parseInt(data[1]),parseInt(data[2])]
  console.log('Profile Loaded: ' + bountyProfile[0] + ' | ' + bountyProfile[1] + ' GEMS | ' + bountyProfile[2] + 'Hits' + bountyProfile[3] + 'Bounties');
  return bountyProfile;
}
function GetBountyProfile(playerID){
  var bounty_profile;
  // Check if bounty profile exists -- create one if it doesn't
  if (!fs.existsSync(__dirname+'/bounty/'+playerID+'.txt')){
    bounty_profile = CreateNewBountyProfile(playerID);
  }else{
    bounty_profile = LoadExistingBountyProfile(playerID);
  }
  return bounty_profile;
}
function OverwriteBountyProfile(bountyID, newBounty, newKills, newReds){fs.writeFileSync(__dirname+'/bounty/'+bountyID+'.txt', newBounty+'-'+newKills+'-'+newReds,'utf8');}
function OverwriteBountyProfile(bountyProfile){fs.writeFileSync(__dirname+'/bounty/'+bountyProfile[0]+'.txt', bountyProfile[1]+'-'+bountyProfile[2]+'-'+bountyProfile[3],'utf8');}

function IncrementBounties(playerID){
  var infProf = GetBountyProfile(playerID);
  infProf[3]++;
  OverwriteBountyProfile(infProf);
}
function IncrementKills(playerID){
  var infProf = GetBountyProfile(playerID);
  infProf[2]++;
  OverwriteBountyProfile(infProf);
}

function LoadHitData(playerID){
  var data = fs.readFileSync(__dirname+'/hits/'+playerID+'.txt','utf8').split('-'); 
  hit = parseInt(data[0]);
  // if(!data[1])
  //   data[1] = config.botID;
  hitOwner = data[1];
  hitTime = data[2];

  var hitProfile = [playerID, hit, hitOwner, hitTime];

  return hitProfile;
}
function SaveHitData(playerID, hitValue, hitOwner = '', hitTime = ''){
  
  fs.writeFileSync(__dirname+'/hits/'+playerID+'.txt',hitValue+'-'+hitOwner+'-'+hitTime,'utf8'); 
}

/*
function BuyHit(playerID, targetID, bountyAmount, message){
  console.log('comparing p:'+playerID+' to t:'+targetID);
  if(playerID == targetID){
    message.reply('YOU CANNOT SET A HIT ON YOURSELF');
    return;
  }
  if(bountyAmount < 100){
    message.reply('YOU CANNOT SET a HIT for less than 100 BP');
    return;
  }

  bounty = null;

  if (!fs.existsSync(__dirname+'/bounty')){
    fs.mkdirSync(__dirname+'/bounty');
  }
  var bProfile = GetBountyProfile(playerID);

  if(bProfile[1] < bountyAmount){
    message.reply('you do not have enough BP to buy a hit!');
    return;
  }

  if(SetNewHit(targetID, bountyAmount, playerID, message)){
    message.reply('you have spent ' + bountyAmount + ' BP to SET a HIT on <@'+targetID+'>');
    SpendBounty(bProfile, bountyAmount, message);
  }
}
*/
function CreateNewBet(playerID, targetID, amount){
  fs.appendFileSync(__dirname+'/bets/'+playerID+'.txt', targetID+'-'+amount, 'utf8');
  console.log('New Bet Created!');
  return LoadExistingBet(playerID);
}
function LoadExistingBet(playerID){
  var data = fs.readFileSync(__dirname+'/bets/'+playerID+'.txt','utf8').split('-'); 
  if(!data[1])
    data[1] = 0;
  var bet = [playerID,parseInt(data[0]),parseInt(data[1])]
  console.log('Bet Loaded: ' + bet[0] + ' | ' + bet[1] + ' GEMS | ' + bet[2]);
  return bet;
}
function OverwriteBet(bet){fs.writeFileSync(__dirname+'/bets/'+bet[0]+'.txt', bet[1]+'-'+bet[2],'utf8');}



function SetBet(targetID, bountyAmount,ownerID, message){
  if (!fs.existsSync(__dirname+'/hits/'+targetID+'.txt')){ // if hit doesnt exist
    message.reply('THERE IS NO HIT ON THIS PLAYER!');
    return;
  }else{ // if hit exists
    var hitProfile = LoadHitData(targetID);
    if(hitProfile[1] == 0){
      message.reply('THERE IS NO HIT ON THIS PLAYER!');
      return;
    }
  }
  if(targetID == message.author){
    message.reply('you cannot bet on yourself dying, thats too easy!');
    return false;
  }else if(targetID == config.botID){
    message.reply('You cannot bet on the bot, the bot will never die!');
    return false;
  }
  var bet;
  if (!fs.existsSync(__dirname+'/bets')){
    fs.mkdirSync(__dirname+'/bets');
  }
  var mybounty = GetBountyProfile(ownerID);
  if (!fs.existsSync(__dirname+'/bets/'+ownerID+'.txt')){
    if(mybounty[1] >= bountyAmount){
      SpendBounty(mybounty,bountyAmount,message);
      message.reply('your bet for '+bountyAmount+' GEMS has been set!');
      CreateNewBet(ownerID, targetID, bountyAmount);
      return true;
    }else{
      message.reply('You cannot afford this bet!');
      return false;
    }
  }else{
    bet = LoadExistingBet(ownerID);
    if(bet[1] == targetID){
      if(mybounty[1] >= bountyAmount){
        SpendBounty(mybounty,bountyAmount,message);
        message.reply('your bet for '+bountyAmount+' GEMS has been set!');
        console.log('Saved raised hit on ' + bet[0] + ' for ' + bountyAmount + ' GEMS');
        return true;
      }else{
        message.reply('You cannot afford this bet!');
        return false;
      }
      
    }else{
      var bName = '';
      message.guild.members.cache.filter(m => !m.user.bot).forEach(member => {
        if(member.id == bet[1]){
          bName = member.displayName;
          message.reply('You already placed a bet you cannot place a new bet until the next bounty is redeemed. You can, however, raise your current bet on ' + bName);
          return false;
        }
      });
    }
  }
  
}

function SetNewHit(targetID, bountyAmount,ownerID, message){
  if(targetID == config.botID){
    message.reply('You cannot set a hit on the bot!');
    return false;
  }
  // var hProfile = LoadHitData(targetID);
  var hProfile = GetHit(targetID);
  var reward = hProfile[1];

  

  if(hProfile[2]){
	if(isNaN(hProfile[1])){
		message.reply('OOF, The user: <@'+targetID+'> had an invalid hit reward. I will fix that right now and overwrite it with your hit value. Please report this as a bug to Calzep.');
		reward = 0;
	}
    if(hProfile[2] != ownerID){
      message.reply('The user: <@'+targetID+'> already has a hit placed by <@'+hProfile[2]+'>!\nYou can not place a hit on a user who already has one.');
      return false;
    }else{
      reward += bountyAmount;
      SaveHitData(targetID,reward,ownerID, new Date());
      console.log('Saved raised hit on ' + hProfile[0] + ' for ' + bountyAmount + ' GEMS');
      return true;
    }
  }
  IncrementBounties(targetID);
  SaveHitData(targetID,bountyAmount,ownerID, new Date());
  console.log('Saved hit on ' + hProfile[0] + ' for ' + bountyAmount + ' GEMS');
  return true;
}

function SetRandomBounty(message){
  fs.readdir(__dirname+'/bounty/', (err, files) => {
    if (err)
      console.log(err);
    else {
      var ids = new Array(files.length);
      var i = 0;
      console.log("Scanning all bounty profiles:");
      files.forEach(file => {
        var pid = file.split('.')[0];
        console.log(pid);
        var p = LoadExistingBountyProfile(pid);
        ids[i] = p[0];
        i++;
        console.log(i);
      })
      var randomFileIndex = getRandInt(ids.length);
      console.log ('Random Index: ' + randomFileIndex);

      var randomTarget = ids[randomFileIndex];
      console.log('Selected Profile: ' + randomTarget);

      var randomBounty = (getRandInt(19)+1);
      console.log ('Random Bounty Value: ' + randomBounty);
      message.channel.send('I have set a random bounty on <@'+randomTarget+'> for ' + randomBounty + ' GEMS!');
      SetNewHit(randomTarget,randomBounty,config.botID, message);
    }
  })
}

function PayoutBets(targetID, message){
  fs.readdir(__dirname+'/bets/', (err, files) => {
    if (err)
      console.log(err);
    else {
      console.log("Scanning all bets:");
      files.forEach(file => {
        var pid = file.split('.')[0];
        var p = LoadExistingBet(pid);
        var reward = (p[2]*1.5);
        if(p[1] == targetID){
          var b = GetBountyProfile(p[0]);
          b[1] += reward;
          OverwriteBountyProfile(b);
          message.channel.send('<@'+p[0]+'> you won ' + reward + ' GEMS for your bet on ' + '<@'+targetID+'>' + '!');
        }
      })
    }
  })
  

  fs.readdir(__dirname+'/bets/', (err, files) => {
    if (err)
      console.log(err);
    else {
      for(const file of files){
        fs.unlinkSync(__dirname+'/bets/'+file);
      }
    }
  })
  
}

function getRandInt(max){return Math.floor(Math.random()*Math.floor(max))}

function ResetBP(playerID, message, replyBP = true){
  if (!fs.existsSync(__dirname+'/bounty')){
    fs.mkdirSync(__dirname+'/bounty');
  }
  var bprofile = GetBountyProfile(playerID);
  fs.writeFileSync(__dirname+'/bounty/'+playerID+'.txt', '0'+'-'+bprofile[1]+'-'+bprofile[2]+'-'+bprofile[3], 'utf8') 
  if(replyBP){
    let b = parseInt(fs.readFileSync(__dirname+'/bounty/'+playerID+'.txt', 'utf8'));
    message.reply('you have ' + b + ' GEMS');
  }
}

function ResetAllBP(message){

  if (!fs.existsSync(__dirname+'/bounty')){
    fs.mkdirSync(__dirname+'/bounty');
  }
  message.guild.members.cache.filter(m => !m.user.bot).forEach(member => ResetBP(member.user, message, false));
  
}

function RedeemHit(playerID, target, message){
  var bountyProfile = GetBountyProfile(playerID);
  var bounty = bountyProfile[1];
  
  
  if (!fs.existsSync(__dirname+'/hits/'+target+'.txt')){ // if hit doesnt exist
    message.reply('THERE IS NO HIT ON THIS PLAYER!');
    return;
  }else{ // if hit exists
    var hitProfile = LoadHitData(target);
    var hOwner = hitProfile[2];
    if(hOwner == playerID){
      message.reply('You can not redeem a hit that your purchased!');    
      return;
    }else{
      var reward = hitProfile[1];
      if(reward == 0){
        message.reply('THERE IS NO HIT ON THIS PLAYER!');
        return;
      }
      if(playerID == target){
        if(bounty >= reward){
          SpendBounty(bountyProfile,reward,message);
          message.reply('You paid the bounty off to redeem a hit on yourself!');   
        }else{
          message.reply('You cannot afford to pay off your own bounty!');
        }
      }else{
        console.log('bounty before reward: '+bounty);
        bounty += reward;    
        fs.writeFileSync(__dirname+'/bounty/'+playerID+'.txt', bounty, 'utf8');
        message.reply('CONGRATZ, you redeemed a hit on ' + '<@'+target+'>, and earned a reward of ' + reward + ' GEMS, you now have a total of ' + bounty + ' GEMS.');
        IncrementKills(playerID);   
        PayoutBets(target, message);
      }
      SaveHitData(target,0,'','');
    }
  }
}

function SpendBounty(bountyProfile, amount, message){
  bountyProfile[1] -= amount;
  OverwriteBountyProfile(bountyProfile);
  message.reply('you have ' + bountyProfile[1] + ' GEMS remaining.');
}

function GetHit(playerID, message){
  if (!fs.existsSync(__dirname+'/hits/'+playerID+'.txt')){
    fs.appendFileSync(__dirname+'/hits/'+playerID+'.txt', '0-NaN', 'utf8');
  }else{
    var hitProf = LoadHitData(playerID);
    if(hitProf[1] > 0)
      // message.channel.send('<@'+playerID+'> - ' + hitProf[1]);
      return ('\n**['+hitProf[1]+']** - <@'+playerID+'> -  *(Hit Set By: <@'+hitProf[2]+'>)*' + '\n' + hitProf[3]);
  }
  return '';
}
function GetHits(message){
  
  hits = null;

  if (!fs.existsSync(__dirname+'/hits')){
    fs.mkdirSync(__dirname+'/hits');
  }
  var currentHits = '\n'+'';
  message.guild.members.cache.filter(m => !m.user.bot).forEach(member => currentHits += GetHit(member.user, message));
  if(currentHits == '\n'+'')
	message.reply('THESE ARE NO CURRENT HITS AT THIS TIME');
  else
    message.reply('THESE ARE THE CURRENT HITS:'+currentHits);
  
}
function GetBounty(playerID, message){
  
  bounty = null;

  if (!fs.existsSync(__dirname+'/bounty')){
    fs.mkdirSync(__dirname+'/bounty');
	message.reply('Welcome to the Bounty Game!');
  }
  var p = GetBountyProfile(playerID)
  message.reply('you have ' + p[1] + ' GEMS | Infamy:' + (p[2]+p[3]) + ' (Kills:'+p[2]+'|Bounties:'+p[3]+')');
}

function GetInfamy(playerID, message){
  if(playerID == config.botID){
    message.reply('What are you even doing?');
    return;
  }
  bounty = null;

  if (!fs.existsSync(__dirname+'/bounty')){
    fs.mkdirSync(__dirname+'/bounty');
  }
  var p;
  if (!fs.existsSync(__dirname+'/bounty/'+playerID+'.txt')){
    message.channel.send('This person has not played the bounty game. :(');
    return;
  }else{
    p = LoadExistingBountyProfile(playerID);
    message.channel.send(' <@'+playerID+'> - Infamy: ' + (p[2]+p[3]));
  }
  
}
