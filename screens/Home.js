import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { getUserByEmail, updateUserImage, updateUserDetails, initDatabaseWithTables, updatePassword, getScheduleByTurma, getEventsByTurma, populateInitialData, addSchedule, deleteSchedule, updateSchedule } from '../db/database';
import * as ImagePicker from 'expo-image-picker';


export default function Home({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editScheduleModalVisible, setEditScheduleModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editTime, setEditTime] = useState('');
  const [editMonday, setEditMonday] = useState('');
  const [editTuesday, setEditTuesday] = useState('');
  const [editWednesday, setEditWednesday] = useState('');
  const [editThursday, setEditThursday] = useState('');
  const [editFriday, setEditFriday] = useState('');

  useEffect(() => {
    const init = async () => {
      await initDatabaseWithTables();
      await populateInitialData();
      await loadUserData();
    };
    init();
  }, []);

  const loadUserData = async () => {
    if (route?.params?.email) {
      const userData = await getUserByEmail(route.params.email);
      setUser(userData);
      setNewName(userData.nome);
      setNewEmail(userData.email);
      await loadSchedule(userData.turma);
      await loadEvents(userData.turma);
    } else {
      console.error('Email não fornecido.');
      navigation.navigate('Login');
    }
    setLoading(false);
  };

  const loadSchedule = async (turma) => {
    try {
      const scheduleData = await getScheduleByTurma(turma);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Erro ao carregar horário:', error);
      setSchedule([]);
    }
  };

  const loadEvents = async (turma) => {
    try {
      const eventsData = await getEventsByTurma(turma);
      setEvents(eventsData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = result.assets[0].uri;

      try {
        await updateUserImage(user.email, imageUrl);
        await loadUserData();
      } catch (error) {
        console.error("Erro ao atualizar a imagem:", error);
        alert("Erro ao atualizar a imagem. Tente novamente.");
      }
    }
  };

  const handleUpdateUser = async () => {
    // Validação do email
    if (!newEmail) {
      Alert.alert("Campo de email não pode estar vazio. Por favor, insira um email.");
      return;
    }
  
    if (!isValidEmail(newEmail)) {
      Alert.alert("Email inválido. Por favor, insira um email válido.");
      return;
    }
  
    // Validação do nome
    if (!newName) {
      Alert.alert("Campo de nome não pode estar vazio. Por favor, insira um nome.");
      return;
    }
  
    // Verifica se os dados foram alterados
    const emailChanged = newEmail !== user.email;
    const nameChanged = newName !== user.nome;
  
    if (!emailChanged && !nameChanged) {
      Alert.alert("Nenhuma alteração detectada.");
      return; // Retorna sem realizar nenhuma ação se não houver alterações
    }
  
    const confirmation = await new Promise((resolve) => {
      Alert.alert(
        "Confirmar Alterações",
        "Você tem certeza que deseja fazer as alterações?",
        [
          { text: "Cancelar", onPress: () => resolve(false), style: "cancel" },
          { text: "Confirmar", onPress: () => resolve(true) },
        ]
      );
    });
  
    if (confirmation) {
      try {
        // Chama a função para atualizar os detalhes do usuário
        await updateUserDetails(user.id, newName, newEmail);
        setUser((prev) => ({ ...prev, nome: newName, email: newEmail }));
        Alert.alert("Detalhes do usuário atualizados com sucesso!");
  
        // Logout automático apenas se o email foi alterado
        if (emailChanged) {
          handleLogout();
        }
      } catch (error) {
        console.error("Erro ao atualizar os detalhes do usuário:", error);
        // Verifica se o erro é relacionado a email já existente no banco de dados
        if (error.message && error.message.includes("Email já cadastrado por outro usuário")) {
          Alert.alert("Esse email já está em uso. Por favor, insira um email diferente.");
        } else {
          Alert.alert("Erro ao atualizar os detalhes do usuário. Tente novamente.");
        }
      }
    }
  };
  
  // Função para validar o formato do email
  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  
  

  const handleChangePassword = async () => {
    // Verifica se as senhas nova e confirmada coincidem
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Todos os campos de senha devem ser preenchidos.");
      return;
    }
  
    if (newPassword !== confirmNewPassword) {
      Alert.alert("As senhas não coincidem. Por favor, insira novamente.");
      return;
    }
  
    // Validação da nova senha
    if (!isValidPassword(newPassword)) {
      Alert.alert("A senha deve ter pelo menos 8 caracteres, incluindo pelo menos 1 número e 1 letra maiúscula.");
      return;
    }
  
    try {
      // Chama a função para atualizar a senha no banco de dados
      await updatePassword(user.email, oldPassword, newPassword);
      
      Alert.alert("Senha alterada com sucesso!");
  
      // Logout automático
      handleLogout();
      
      // Limpa os campos após a alteração
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      Alert.alert(`Erro ao alterar a senha: ${error.message}`);
    }
  };

  const isValidPassword = (password) => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordPattern.test(password);
  };
  
  const handleLogout = () => {
    // Implementar a lógica de logout aqui, por exemplo, limpar o estado do usuário e redirecionar
    setUser(null); // Zera o usuário
    navigation.navigate("Login"); // Redireciona para a tela de login
  };
  
  const logout = () => {
    navigation.navigate('Login');
  };

  // Funções para editar grade horária
  const handleEditSchedule = (item) => {
    setEditingSchedule(item);
    setEditTime(item.time);
    setEditMonday(item.monday);
    setEditTuesday(item.tuesday);
    setEditWednesday(item.wednesday || '');
    setEditThursday(item.thursday || '');
    setEditFriday(item.friday || '');
    setEditScheduleModalVisible(true);
  };

  const handleSaveSchedule = async () => {
    if (!editTime || !editMonday || !editTuesday) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    try {
      await updateSchedule(editingSchedule.id, user.turma, editTime, editMonday, editTuesday, editWednesday, editThursday, editFriday);
      setEditScheduleModalVisible(false);
      await loadSchedule(user.turma);
      Alert.alert('Sucesso', 'Horário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o horário');
    }
  };

  const handleDeleteSchedule = async (id) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este horário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await deleteSchedule(id);
              await loadSchedule(user.turma);
              Alert.alert('Sucesso', 'Horário deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar horário:', error);
              Alert.alert('Erro', 'Não foi possível deletar o horário');
            }
          },
          style: 'destructive'
        }
      ]
    );
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
      <Text style={styles.title}>
        Bem-vindo, <Text style={styles.nome}>{user?.nome}</Text>!
      </Text>

      {/* Grade Horária em formato de tabela */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grade Horária</Text>
          {user?.tipo_usuario !== 'aluno' && (
            <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Adicionar novo horário não implementado ainda')}>
              <Text style={styles.addButtonText}>+ Novo</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Horários</Text>
              <Text style={styles.tableHeaderText}>Segunda</Text>
              <Text style={styles.tableHeaderText}>Terça</Text>
              <Text style={styles.tableHeaderText}>Quarta</Text>
              <Text style={styles.tableHeaderText}>Quinta</Text>
              <Text style={styles.tableHeaderText}>Sexta</Text>
              {user?.tipo_usuario !== 'aluno' && <Text style={styles.tableHeaderText}>Ações</Text>}
            </View>
            {schedule.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{item.time}</Text>
                <Text style={styles.tableCell}>{item.monday}</Text>
                <Text style={styles.tableCell}>{item.tuesday}</Text>
                <Text style={styles.tableCell}>{item.wednesday || '-'}</Text>
                <Text style={styles.tableCell}>{item.thursday || '-'}</Text>
                <Text style={styles.tableCell}>{item.friday || '-'}</Text>
                {user?.tipo_usuario !== 'aluno' && (
                  <View style={styles.actionCell}>
                    <TouchableOpacity onPress={() => handleEditSchedule(item)} style={styles.editButton}>
                      <Text style={styles.actionButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteSchedule(item.id)} style={styles.deleteButton}>
                      <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Eventos Futuros */}
      <View style={styles.containerEventos}>
      <Text style={styles.tituloEventos}>Próximos Eventos</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View style={styles.cardEvento}>
            <Text style={styles.tituloEvento}>{item.title}</Text>
            <Text style={styles.dataEvento}>{item.date}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhum evento disponível.</Text>}
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

      {/* Modal para ProfileScreen e Opções */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Perfil do Usuário</Text>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : require('../assets/default-avatar.png')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
            />
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity onPress={handleUpdateUser} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Alterar Senha:</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha Antiga"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Nova Senha"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirme Nova Senha"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={handleChangePassword} style={styles.changePasswordButton}>
              <Text style={styles.confirmButtonText}>Alterar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Grade Horária */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editScheduleModalVisible}
        onRequestClose={() => setEditScheduleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Horário</Text>
            
            <Text style={styles.label}>Horário:</Text>
            <TextInput
              style={styles.input}
              value={editTime}
              onChangeText={setEditTime}
              placeholder="Ex: 7:00 - 7:50"
            />
            
            <Text style={styles.label}>Segunda:</Text>
            <TextInput
              style={styles.input}
              value={editMonday}
              onChangeText={setEditMonday}
              placeholder="Disciplina"
            />
            
            <Text style={styles.label}>Terça:</Text>
            <TextInput
              style={styles.input}
              value={editTuesday}
              onChangeText={setEditTuesday}
              placeholder="Disciplina"
            />
            
            <Text style={styles.label}>Quarta:</Text>
            <TextInput
              style={styles.input}
              value={editWednesday}
              onChangeText={setEditWednesday}
              placeholder="Disciplina"
            />
            
            <Text style={styles.label}>Quinta:</Text>
            <TextInput
              style={styles.input}
              value={editThursday}
              onChangeText={setEditThursday}
              placeholder="Disciplina"
            />
            
            <Text style={styles.label}>Sexta:</Text>
            <TextInput
              style={styles.input}
              value={editFriday}
              onChangeText={setEditFriday}
              placeholder="Disciplina"
            />
            
            <TouchableOpacity onPress={handleSaveSchedule} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Salvar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setEditScheduleModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.confirmButtonText}>Cancelar</Text>
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
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    paddingTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
  },
  tableHeaderText: {
    flex: 1,
    minWidth: 80,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    minWidth: 80,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    minWidth: 80,
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    gap: 5,
  },
  editButton: {
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  actionButtonText: {
    fontSize: 16,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  navbar: {
    backgroundColor: 'white',  //#00bff2
    position: 'absolute',
    paddingTop: 2,
    paddingBottom: 2,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nome: {
    color: '#00bff2', 
    fontWeight: 'bold', 
  },
  containerEventos: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa', 
  },
  tituloEventos: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center', 
  },
  cardEvento: {
    backgroundColor: '#ffffff', 
    borderRadius: 10, 
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, 
    height: 100, 
    width: '100%', 
    maxWidth: 400, 
  },
  tituloEvento: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00bff2', 
  },
  dataEvento: {
    fontSize: 14,
    color: '#666', 
    marginTop: 4, 
  },
  listContainer: {
    paddingBottom: 16, 
  },
  emptyMessage: {
    fontSize: 18,
    color: '#999', 
    textAlign: 'center', 
  },
});
