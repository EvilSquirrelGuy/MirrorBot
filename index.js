const { Client, EmbedBuilder, GatewayIntentBits, MessageType} = require('discord.js')
const config = require('./config.json')

let channels = []
let webhooks = []

const client = new Client({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers//,
    //GatewayIntentBits.GuildPresences
	]
})

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  for (let channel of config.channels) {
    channels.push(await client.channels.cache.get(channel))
  }
  client.user.setPresence({status: 'dnd'})

  for (let channel of channels) {
    const cw = await channel.fetchWebhooks()
    const webhook = cw.find(wh => wh.token)

    if (!webhook) {
      channel.createWebhook({
        name: client.user.username,
        avatar: client.user.displayAvatarURL()
      })
      const cw = await channel.fetchWebhooks()
      const webhook = cw.find(wh => wh.token)
    }
    webhooks.push(webhook)

  }
})

client.on('messageCreate', async (message) => {
  if (message.webhookId) return
  if (!config.channels.includes(message.channel.id)) return
  
  let replyEmbed = null
  let embeds = []
  let files = []
  let content = message.content

  if (message.reference) {
    let parentMsg = await message.fetchReference()
    let author = parentMsg.author
    let pStickers = Array.from(parentMsg.stickers.values())
    let pAttachments = Array.from(parentMsg.attachments.values())

    replyEmbed = new EmbedBuilder()
      .setAuthor({
        iconURL: author.displayAvatarURL(),
        url: parentMsg.url,
        name: `Replying to: ${author.displayName? author.displayName: author.username}`
      })
      .setDescription(
        parentMsg.content ? parentMsg.content :
        pAttachments.length > 0 ?
        !pAttachments[0].contentType?.startsWith("image") ? 
        `attached file: [${pAttachments[0].name}](${pAttachments[0].url})` : null : null
      )
      .setImage(
        pAttachments.length > 0 ? 
        pAttachments[0].url :
        pStickers.length > 0 ? `https://media.discordapp.net/stickers/${pStickers[0].id}.png` : null
      )
  }

  for (let attachment of message.attachments.values()) {
    files.push({
      attachment: attachment.url,
      name: attachment.name
    })
  }

  for (let sticker of message.stickers.values()) {
    files.push({
      attachment: `https://media.discordapp.net/stickers/${sticker.id}.png`,
      name: `${sticker.id}.png`
    })
  }

  for (let channel of channels) {
    if (message.channel.id != channel.id) {
      if (replyEmbed) await webhooks[channels.indexOf(channel)].send({
        username: message.author.displayName,
        avatarURL: message.author.displayAvatarURL(),
        embeds: [replyEmbed]
      }) 
      await webhooks[channels.indexOf(channel)].send({
        content: content,
        username: message.author.displayName,
        avatarURL: message.author.displayAvatarURL(),
        embeds: embeds,
        files: files
      })
    }
  }
})

//client.on('debug', console.log)

client.login(config.token).catch((err) => {console.error(err)})