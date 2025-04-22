import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import useLyricsStorage from '../../hooks/useLyricsStorage';

interface SongData {
  title: string;
  lyrics: string;
  tabs: string;
  timestamp?: number;
}

const LyricsScreen: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [lyrics, setLyrics] = useState('');
  const [tabs, setTabs] = useState('');
  const [lyricsList, setLyricsList] = useState<{ [key: string]: SongData }>({});
  const { saveSong, loadLyrics, updateSong } = useLyricsStorage();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSong, setCurrentSong] = useState<SongData | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      const loadedLyrics = await loadLyrics();
      setLyricsList(loadedLyrics);
    };
    fetchLyrics();
  }, []);

  const handleSaveSong = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a song title.');
      return;
    }
    if (!lyrics.trim() && !tabs.trim()) {
      Alert.alert('Error', 'Please enter either lyrics or tabs.');
      return;
    }
    await saveSong({ title, lyrics, tabs });
    setTitle('');
    setLyrics('');
    setTabs('');
    Alert.alert('Success', 'Song saved successfully!');
  };

  const openEditModal = (song: SongData) => {
    setCurrentSong(song);
    setTitle(song.title);
    setLyrics(song.lyrics);
    setTabs(song.tabs);
    setModalVisible(true);
  };

  const handleUpdateSong = async () => {
    if (!currentSong) return;

    const updatedSong = {
      ...currentSong,
      title,
      lyrics,
      tabs,
    };

    await updateSong(updatedSong);
    const loadedLyrics = await loadLyrics();
    setLyricsList(loadedLyrics);
    setModalVisible(false);
    setLyrics('');
    setTabs('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Lyrics:</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter song lyrics here"
        value={lyrics}
        onChangeText={setLyrics}
      />
      <Text style={styles.label}>Guitar Tabs:</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Enter guitar tabs here"
        value={tabs}
        onChangeText={setTabs}
      />
      <Button title="Save Song" onPress={handleSaveSong} />

      <Text style={[styles.label, styles.savedSongsHeader]}>Saved Songs:</Text>
      {Object.values(lyricsList).length > 0 ? (
        Object.values(lyricsList).map((song) => (
          <Pressable key={song.title} onPress={() => openEditModal(song)}>
            <View style={styles.savedSongItem}>
              <Text style={styles.songTitle}>{song.title}</Text>
              {song.lyrics && <Text style={styles.songContent}>Lyrics: {song.lyrics}</Text>}
              {song.tabs && <Text style={styles.songContent}>Tabs: {song.tabs}</Text>}
            </View>
          </Pressable>
        ))
      ) : (
        <Text>No saved songs yet.</Text>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Song</Text>
            <TextInput
              style={styles.input}
              placeholder="Song Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput style={styles.input} multiline placeholder="Lyrics" value={lyrics} onChangeText={setLyrics} />
            <TextInput style={styles.input} multiline placeholder="Tabs" value={tabs} onChangeText={setTabs} />
            <Button title="Update Song" onPress={handleUpdateSong} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const SongInputScreen = LyricsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'stretch',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  savedSongsHeader: {
    marginTop: 20,
  },
  savedSongItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  songTitle: {
    fontWeight: 'bold',
  },
  songContent: {
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
export default SongInputScreen;