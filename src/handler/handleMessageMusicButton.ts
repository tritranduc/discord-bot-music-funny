import {
  CacheType,
  CollectorFilter, Message,
  MessageComponentInteraction,
  MessagePayload,
  WebhookEditMessageOptions
} from 'discord.js';
import { Queue, RepeatMode, Song } from 'distube';
import {
  ButtonId,
  GetMessageMusicButton
} from '../utils/GetMessageMusicButton';
import { getMusicEmbed } from '../utils/sendMusicEmbed';

export const getMessageSend = (
  queue: Queue,
  nowSong: Song<unknown>,
  username: string | undefined
): string | MessagePayload | WebhookEditMessageOptions => {
  const row = GetMessageMusicButton(queue);
  const embed = getMusicEmbed(queue, nowSong, username);
  return {
    components: [...row],
    embeds: [...embed],
  };
};

export const handleMessageMusicButton = async (
  message: Message<boolean>,
  queue: Queue,
  username: string | undefined
) => {
  const filter: CollectorFilter<[MessageComponentInteraction<CacheType>]> = (
    _m
  ) => true;
  const collector = message.createMessageComponentCollector({
    filter,
  });

  collector.on('collect', async (m) => {
    if (!m.isButton()) return;
    const nowSong = queue.songs[0];
    if (m.customId == ButtonId.PauseMusic) {
      queue.pause();
      m.update(getMessageSend(queue, nowSong, username));
    } else if (m.customId == ButtonId.ResumeMusic) {
      queue.resume();
      m.update(getMessageSend(queue, nowSong, username));
    } else if (m.customId == ButtonId.SkipMusic) {
      queue.skip();
    } else if (m.customId == ButtonId.StopMusic) {
      queue.stop();
    } else if (m.customId == ButtonId.loopMusic) {
      queue.repeatMode == RepeatMode.SONG
        ? queue.setRepeatMode(RepeatMode.DISABLED)
        : queue.setRepeatMode(RepeatMode.SONG);
      m.update(getMessageSend(queue, nowSong, username));
    }
  });
};
