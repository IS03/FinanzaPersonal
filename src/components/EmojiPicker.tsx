import React from 'react';
import EmojiPickerReact, { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  return (
    <EmojiPickerReact
      onEmojiClick={(emojiData) => {
        onSelect(emojiData.emoji);
      }}
      theme={Theme.LIGHT}
      width={350}
      height={400}
      previewConfig={{
        showPreview: false
      }}
      skinTonesDisabled
      lazyLoadEmojis
    />
  );
}; 