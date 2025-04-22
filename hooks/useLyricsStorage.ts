import * as FileSystem from 'expo-file-system';

import { Platform, AsyncStorage } from 'react-native';
import { useState, useEffect } from 'react';

interface LyricData {
  title: string;
  lyrics: string;
  tabs: string;
  [key: string]: string;
}

const useLyricsStorage = () => {
  const [lyricsList, setLyricsList] = useState<LyricData[]>([]);
  
  const isWeb = Platform.OS === 'web';
  const lyricsDir = isWeb ? '' : `${FileSystem.documentDirectory}lyrics/`;

  const createDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(lyricsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(lyricsDir, { intermediates: true });
    }
  };
  
  const saveSong = async (data: LyricData) => {
    if(isWeb) {
      const existingData = await AsyncStorage.getItem('lyrics');
      let allLyrics: LyricData[] = [];
      if(existingData){
        allLyrics = JSON.parse(existingData);
      }
      const lyricToSave = {...data}
      allLyrics.push(lyricToSave);
      await AsyncStorage.setItem('lyrics', JSON.stringify(allLyrics));
    } else {
      await createDirectory();
      const filePath = `${lyricsDir}${data.title}.json`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
    await loadLyrics(); 
  };

  const loadLyrics = async () => {
    if(isWeb){
      const storedLyrics = await AsyncStorage.getItem('lyrics');
      if(storedLyrics) {
        return JSON.parse(storedLyrics) as LyricData[];
      } else {
        return [];
      }
    } else {
      await createDirectory();
      const dir = await FileSystem.readDirectoryAsync(lyricsDir);
      const loadedLyrics: LyricData[] = [];
  
      for (const file of dir) {
        const fileInfo = await FileSystem.getInfoAsync(`${lyricsDir}${file}`);
        if (!fileInfo.isDirectory && file.endsWith(".json")) {
          const fileContent = await FileSystem.readAsStringAsync(`${lyricsDir}${file}`);
          const data = JSON.parse(fileContent) as LyricData;
          loadedLyrics.push(data);
        }
      }
      return loadedLyrics;
    }
  };

  const deleteLyric = async (title:string) => {
    if (!isWeb){
      const filePath = `${lyricsDir}${title}.json`;
      await FileSystem.deleteAsync(filePath, { idempotent: true })
    }

    return loadedLyrics;
  };

  const loadLyricsWrapper = async ()=>{
    setLyricsList(await loadLyrics());
  }

  return { lyricsList, saveSong, loadLyrics: loadLyricsWrapper, deleteLyric };
};

export default useLyricsStorage;