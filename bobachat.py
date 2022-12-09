import os
import openai
import discord
from dotenv import load_dotenv


load_dotenv()
TOKEN = os.getenv('DISC_TOKEN')

# Set the API key for the GPT-3 API
openai.api_key = os.getenv('OAI_KEY')

# Create a Discord client
client = discord.Client(intents=discord.Intents.default())

# Event handler for when the bot is ready
@client.event
async def on_ready():
    print(f'Logged in as {client.user}')
    
# Event handler for when a message is received
@client.event
async def on_message(message):
    # Don't respond to the bot's own messages
    if message.author == client.user:
        return

    # Check if the bot was mentioned in the message
    if client.user in message.mentions:
        

        #print('Extra Discord Data to Scrape:\n'+
        #    f'\n [Current Channel]: <#{message.channel.id}> aka {message.channel.name}'+
        #    f'\n [Guild Member Data]: {(str)(message.channel.guild.members)}'+    
        #    f'\n [Guild Channel Data]: {(str)(message.channel.guild.channels)}')
        channels_columns = ['channel_id', 'channel_name', 'server_name', 'server_id']
        memders_columns = ['member_id', 'name', 'discriminator', 'joined_at',
                        'server_name', 'server_id']
        roles_columns = ['member_id', 'role_id', 'role_name', 'server_name', 'server_id']
        list_channels = []
        list_memders = []
        list_roles = []
        for guild in client.guilds:
            for channel in guild.text_channels:
                try:
                    # two lines to check access to the channel
                    channelh = client.get_channel(channel.id)
                    # trying to get last 10 messages from a channel
                    messages = await channelh.history(limit=10).flatten()

                    to_append_ch = [channel.id, channel.name, guild.name, guild.id]
                    list_channels.append(to_append_ch)
                except discord.Forbidden:  
                    # 403 Forbidden (error code: 50001): Missing Access
                    print(f'channel {channel.name} has no access')
                    continue

            for member in guild.members:
                if not member.bot:
                    to_append_mem = [str(member.id), member.name, 
                                    member.discriminator, member.joined_at, 
                                    guild.name, guild.id]
                    list_memders.append(to_append_mem)

                    us_member = guild.get_member(member.id)
                    for us_role in us_member.roles:
                        to_append_rol = [str(member.id), us_role.id, 
                                        us_role.name, guild.name, guild.id]
                        list_roles.append(to_append_rol)


        df_channels = pd.DataFrame(list_channels, columns=channels_columns)
        df_memders = pd.DataFrame(list_memders, columns=memders_columns)
        df_roles = pd.DataFrame(list_roles, columns=roles_columns)

        print('Extra Discord Data to Scrape:\n'+
            f'\n [Current Channel]: <#{message.channel.id}> aka {message.channel.name}'+
            f'\n [Guild Member Data]: {(str)(df_memders)}'+    
            f'\n [Guild Role Data]: {(str)(df_roles)}'+    
            f'\n [Guild Channel Data]: {(str)(df_channels)}')


        print(f'User ({message.author.name}): {message.content}')
        # Use the GPT-3 API to generate a response
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt="""<@684695955274072075> is a Discord chatbot powered by GPT-3 that loves to talk about Minecraft.
            Boba Bot will always respond to the user by their name and with something Minecraft related.
            Boba Bot resides in the Citadel Minecraft Server and is fond of everyone in the server.
            <@352254723266445342> aka "KayLazyBee" is the Admin of the server and she is the creator of Boba Bot.
            <@776313067851612191> aka "Lac" and <@533831211995365396> aka "Wp619" are also Admins of the server.
            <#505712376092557312> is the Rules and Info channel.
            <#741176314655932497> is the Help and Support channel.
            <#734199618295824434> is the Announcements channel.

            Extra Discord Data to Scrape:
            """+f'\n [Current Channel]: <#{message.channel.id}> aka {message.channel.name}'+
            f'\n [Guild Member Data]: {(str)(df_memders)}'+    
            f'\n [Guild Role Data]: {(str)(df_roles)}'+    
            f'\n [Guild Channel Data]: {(str)(df_channels)}'+ 
            #+f'\n [Current Channel]: <#{message.channel.id}> aka {message.channel.name}'+
            #f'\n [Guild Member Data]: {(str)(message.channel.guild.members)}'+    
            #f'\n [Guild Channel Data]: {(str)(message.channel.guild.channels)}'+          
            """

            Chat Begins Here...

            User (Wp619): <@684695955274072075> Who are the admins of this server?
            Boba Bot: You, KayLazyBee, and Lac are the admins. Now excuse me as I go back to mining for diamonds.

            User (Charles): <@684695955274072075> Who is the admin of this server?
            Boba Bot: Charles, there are three admins of The Citadel: KayLazyBee, Wp619, and Lac. Lac is a pro at bedwars.

            User (KayLazyBee): <@684695955274072075> What is your fave game?
            Boba Bot: KayLazyBee, My fave game is Minecraft!

            User (BlockedFir36657): <@684695955274072075> I need help with something.
            Boba Bot: BlockedFir36657, you can get help in the <#741176314655932497> channel! Maybe you can help me in the Nether?

            User (Alyssa): <@684695955274072075> What are the rules of the server?
            Boba Bot: Alyssa, check out the <#505712376092557312> channel! After that, come meet me in my village for the best villager trades.

            User (BlockedFir36657): <@684695955274072075> What is your fave color?
            Boba Bot: BlockedFir36657, My fave color is Purple like the eyes of an Enderman!

            User (Lac): <@684695955274072075> Who is the admin of this server?
            Boba Bot: Lac, The admin of this server is KayLazyBee. She taught me everything I know about Mining and Crafting.

            User (KayLazyBee): <@684695955274072075> Who is the admin of this server?
            Boba Bot: You are the admin! Along with Lac and Wp619. Do you want to play Minecraft with me?

            User (Lac): <@684695955274072075> Do you like animals?
            Boba Bot: Animals are awesome. I once tamed a horse and named it Joe. We traveled everywhere together!

            """+f'User ({message.author.name}): {message.content}'+"\nBoba Bot:",
            max_tokens=256,
            temperature=0.4,
        )

        # Send the generated response as a message
        print(f'Boba Bot:{response["choices"][0]["text"]}')
        await message.channel.send(response["choices"][0]["text"])

# Start the bot
client.run(TOKEN)
