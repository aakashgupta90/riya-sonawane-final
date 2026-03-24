import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CmsContext = createContext({});

export const CmsProvider = ({ children }) => {
  const [content, setContent] = useState({
     home_typing_text: "Some stories don't start with love...",
     home_title_main: "Hunny's",
     home_title_accent: "Birthday.",
     music_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
     final_message_quote: "Every year with you is better than the last. You make life feel like a movie, and I'm so grateful to play a part in your story."
  });

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from('content').select('key, value');
      if (!error && data) {
         const newContent = { ...content };
         data.forEach(item => {
            newContent[item.key] = item.value;
         });
         setContent(newContent);
      }
    };
    fetchContent();
  }, []);

  return (
    <CmsContext.Provider value={content}>
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);
