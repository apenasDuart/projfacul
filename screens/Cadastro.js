import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, Text, Modal, FlatList } from 'react-native';
import { initDatabaseWithTables, registerUser } from '../db/database';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [turma, setTurma] = useState('');
  const [error, setError] = useState('');
  const [turmaModalVisible, setTurmaModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isGifFinished, setIsGifFinished] = useState(false);

  const turmasDisponiveis = [
    { id: 1, nome: 'Turma A' },
    { id: 2, nome: 'Turma B' },
    { id: 3, nome: 'Turma C' },
  ];

  useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabaseWithTables();
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        exibirErro('Erro ao inicializar o banco de dados.');
      }
    };

    initializeDB();

    const gifDuration = 3000;

    const timer = setTimeout(() => {
      setIsGifFinished(true);
    }, gifDuration);

    return () => clearTimeout(timer);
  }, []);

  const exibirErro = (mensagem) => {
    setError(mensagem);
    setErrorModalVisible(true);
  };

  const validarSenha = (senha) => {
    const senhaValida = /^(?=.*[0-9]).{8,}$/; // Pelo menos 8 caracteres e pelo menos 1 número
    return senhaValida.test(senha);
  };

  const cadastro = async () => {
    if (!nome || !email || !senha || !confirmarSenha || !turma) {
      exibirErro('Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      exibirErro('As senhas não coincidem.');
      return;
    }

    if (!validarSenha(senha)) {
      exibirErro('A senha deve ter pelo menos 8 caracteres e incluir pelo menos 1 número.');
      return;
    }

    try {
      await registerUser(nome, email, senha, turma);
      alert('Usuário cadastrado com sucesso!');
      navigation.navigate('Login');
    } catch (err) {
      if (err.message === 'Email já cadastrado') {
        exibirErro('Este email já está cadastrado. Tente usar outro.');
      } else {
        console.error('Erro inesperado ao cadastrar:', err);
        exibirErro('Erro ao cadastrar. Tente novamente.');
      }
    }
  };

  const abrirModalTurmas = () => {
    setTurmaModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {isGifFinished ? (
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      ) : (
        <Image style={styles.logo} source={require('../assets/logo.gif')} />
      )}

      <TextInput placeholder="Digite seu nome" style={styles.textInput} onChangeText={setNome} value={nome} />
      <TextInput placeholder="Digite seu email" style={styles.textInput} onChangeText={setEmail} value={email} />
      <TextInput secureTextEntry={true} placeholder="Digite sua senha" style={styles.textInput} onChangeText={setSenha} value={senha} />
      <TextInput secureTextEntry={true} placeholder="Confirme sua senha" style={styles.textInput} onChangeText={setConfirmarSenha} value={confirmarSenha} />

      <TouchableOpacity style={styles.turmaInput} onPress={abrirModalTurmas}>
        <Text style={styles.turmaText}>{turma || 'Selecione sua turma'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Já possui uma conta? <Text style={styles.cadastreSeText}>Login!</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCadastro} onPress={cadastro} activeOpacity={0.8}>
        <Text style={styles.btnText}>CADASTRAR!</Text>
      </TouchableOpacity>

      {/* Modal para escolher turma */}
      <Modal visible={turmaModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione sua turma:</Text>
            <FlatList
              data={turmasDisponiveis}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setTurma(item.nome);
                    setTurmaModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setTurmaModalVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para exibir erros */}
      <Modal visible={errorModalVisible} transparent={true} animationType="fade">
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
            {/* "X" no canto superior direito */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.errorModalText}>{error}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 76,
    marginBottom: 20,
    marginTop: -40,
  },
  textInput: {
    width: '80%',
    height: 50,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00bff2',
    fontSize: 18,
  },
  turmaInput: {
    width: '80%',
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: -10,
    backgroundColor: '#004a80', 
  },
  turmaText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnCadastro: {
    width: '60%',
    height: 50,
    backgroundColor: '#00bff2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45,
  },
  btnText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorModalContent: {
    width: '80%',
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  errorModalText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 30,
    height: 30,
    borderRadius: 15, // Forma circular
    backgroundColor: 'white', // Transparente para ver o fundo
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalText: {
    fontSize: 18,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#00bff2',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    fontSize: 16,
  },
  cadastreSeText: {
    fontWeight: 'bold',
    color: '#00bff2',
  },
});
