import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { getUserByEmail, updateUserImage, initDatabaseWithTables } from '../db/database';
import * as ImagePicker from 'expo-image-picker';

export default function Home({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initDatabaseWithTables();
      await loadUserData();
    };
    init();
  }, []);

  const loadUserData = async () => {
    if (route?.params?.email) {
      const userData = await getUserByEmail(route.params.email);
      setUser(userData);
      loadSchedule(userData.turma);
      loadEvents(userData.turma);
    } else {
      console.error('Email não fornecido.');
      navigation.navigate('Login');
    }
    setLoading(false);
  };

  const loadSchedule = (turma) => {
    const schedules = {
       'Turma A': [
    { time: '7:00 - 7:50', monday: 'Ing', tuesday: 'Hist', wednesday: 'Mat', thursday: 'Geo', friday: 'Edu' },
    { time: '7:50 - 8:40', monday: 'Hist', tuesday: 'Port', wednesday: 'Mat', thursday: 'Cien', friday: 'Mat' },
    { time: '8:40 - 9:30', monday: 'Mat', tuesday: 'Mat', wednesday: 'Edu', thursday: 'Hist', friday: 'Port' },
    { time: '9:30 - 9:50', monday: 'Intervalo', tuesday: 'Intervalo', wednesday: 'Intervalo', thursday: 'Intervalo', friday: 'Intervalo' },
    { time: '9:50 - 10:40', monday: 'Port', tuesday: 'Hist', wednesday: 'Geo', thursday: 'Mat', friday: 'Edu' },
    { time: '10:40 - 11:30', monday: 'Cien', tuesday: 'Ing', wednesday: 'Hist', thursday: 'Port', friday: 'Mat' },
    { time: '11:30 - 12:20', monday: 'Edu', tuesday: 'Geo', wednesday: 'Mat', thursday: 'Hist', friday: 'Port' },
  ],
  'Turma B': [
    { time: '7:00 - 7:50', monday: 'Mat', tuesday: 'Geo', wednesday: 'Hist', thursday: 'Edu', friday: 'Cien' },
    { time: '7:50 - 8:40', monday: 'Física', tuesday: 'Química', wednesday: 'Mat', thursday: 'Port', friday: 'Hist' },
    { time: '8:40 - 9:30', monday: 'Ing', tuesday: 'Mat', wednesday: 'Geo', thursday: 'Hist', friday: 'Edu' },
    { time: '9:30 - 9:50', monday: 'Intervalo', tuesday: 'Intervalo', wednesday: 'Intervalo', thursday: 'Intervalo', friday: 'Intervalo' },
    { time: '9:50 - 10:40', monday: 'Mat', tuesday: 'Hist', wednesday: 'Port', thursday: 'Edu', friday: 'Cien' },
    { time: '10:40 - 11:30', monday: 'Edu', tuesday: 'Mat', wednesday: 'Física', thursday: 'Geo', friday: 'Hist' },
    { time: '11:30 - 12:20', monday: 'Hist', tuesday: 'Física', wednesday: 'Mat', thursday: 'Port', friday: 'Edu' },
  ],
  'Turma C': [
    { time: '7:00 - 7:50', monday: 'Geo', tuesday: 'Cien', wednesday: 'Mat', thursday: 'Hist', friday: 'Edu' },
    { time: '7:50 - 8:40', monday: 'Port', tuesday: 'Mat', wednesday: 'Física', thursday: 'Química', friday: 'Geo' },
    { time: '8:40 - 9:30', monday: 'Hist', tuesday: 'Edu', wednesday: 'Mat', thursday: 'Ing', friday: 'Port' },
    { time: '9:30 - 9:50', monday: 'Intervalo', tuesday: 'Intervalo', wednesday: 'Intervalo', thursday: 'Intervalo', friday: 'Intervalo' },
    { time: '9:50 - 10:40', monday: 'Edu', tuesday: 'Mat', wednesday: 'Geo', thursday: 'Hist', friday: 'Cien' },
    { time: '10:40 - 11:30', monday: 'Mat', tuesday: 'Física', wednesday: 'Edu', thursday: 'Port', friday: 'Hist' },
    { time: '11:30 - 12:20', monday: 'Física', tuesday: 'Geo', wednesday: 'Mat', thursday: 'Edu', friday: 'Hist' },
  ],
    };
    setSchedule(schedules[turma] || []);
  };

  const loadEvents = (turma) => {
    const eventList = {
      'Turma A': [
        { id: '1', title: 'Feira de Ciências', date: '2024-10-10' },
        { id: '2', title: 'Gincana Escolar', date: '2024-11-05' },
      ],
      'Turma B': [
        { id: '1', title: 'Festival de Artes', date: '2024-09-30' },
        { id: '2', title: 'Passeio Escolar', date: '2024-12-02' },
      ],
    };
    setEvents(eventList[turma] || []);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = result.assets[0].uri; // Acesse a URI corretamente
      
      try {
        await updateUserImage(user.email, imageUrl); // Atualiza a imagem no banco de dados
        await loadUserData(); // Recarrega os dados do usuário para obter a nova imagem
      } catch (error) {
        console.error("Erro ao atualizar a imagem:", error);
        alert("Erro ao atualizar a imagem. Tente novamente.");
      }
    }
  };

  const logout = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Desculpe, precisamos de permissão para acessar suas fotos!');
      }
    };
    getPermission();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {user?.nome}!</Text>

      {/* Grade Horária em formato de tabela */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grade Horária</Text>
        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Horários</Text>
              <Text style={styles.tableHeaderText}>Segunda</Text>
              <Text style={styles.tableHeaderText}>Terça</Text>
              <Text style={styles.tableHeaderText}>Quarta</Text>
              <Text style={styles.tableHeaderText}>Quinta</Text>
              <Text style={styles.tableHeaderText}>Sexta</Text>
            </View>
            {schedule.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{item.time}</Text>
                <Text style={styles.tableCell}>{item.monday}</Text>
                <Text style={styles.tableCell}>{item.tuesday}</Text>
                <Text style={styles.tableCell}>{item.wednesday || '-'}</Text>
                <Text style={styles.tableCell}>{item.thursday || '-'}</Text>
                <Text style={styles.tableCell}>{item.friday || '-'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Eventos Futuros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <Text style={styles.eventItem}>{item.title} - {item.date}</Text>
          )}
          keyExtractor={item => item.id}
        />
      </View>

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.avatarContainer}>
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Modal para opções */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.modalOption}>Mudar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.modalOption}>Deslogar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5, // Para bordas arredondadas
    overflow: 'hidden', // Para que as bordas arredondadas funcionem
    width: 700, // Aumenta a largura da tabela conforme necessário
  },
  tableHeader: {
    height: 40,
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  tableHeaderText: {
    flex: 1,
    height: 50, // Aumentar a altura se necessário
    padding: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ccc', // Borda entre os cabeçalhos
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    padding: 15, // Ajuste o padding para mais espaço
    height: 50,
    textAlign: 'center',
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    borderRightWidth: 1,
    borderRightColor: '#ccc', // Borda entre as células
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalOption: {
    padding: 10,
    fontSize: 18,
  },
  closeModal: {
    padding: 10,
    fontSize: 16,
    color: 'red',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
