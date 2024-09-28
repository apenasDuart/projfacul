import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Image, Text, Modal } from 'react-native';
import { loginUser, getUserByEmail } from '../db/database'; // Importa a nova função

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isGifFinished, setIsGifFinished] = useState(false);

  useEffect(() => {
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

  const handleLogin = async () => {
    setError('');
  
    // Verificações dos campos
    if (!email) {
      exibirErro('Espaço do email em branco');
      return;
    }
  
    if (!senha) {
      exibirErro('Espaço da senha em branco');
      return;
    }
  
    // Verifica se o email existe no banco de dados
    const existingUser = await getUserByEmail(email);
    
    if (!existingUser) {
      exibirErro('Email não cadastrado');
      return;
    }
  
    // Agora tenta fazer o login
    try {
      const user = await loginUser(email, senha);
      alert(`Login bem-sucedido! Bem-vindo, ${user.nome}`);
      
      // Navega para a HomeScreen passando o email como parâmetro
      navigation.navigate('Home', { email: user.email });
      
    } catch (err) {
      // Aqui lidamos com o erro de senha inválida
      exibirErro('Senha incorreta');
    }
  };

  return (
    <View style={styles.container}>
      {isGifFinished ? (
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      ) : (
        <Image style={styles.logo} source={require('../assets/logo.gif')} />
      )}

      <TextInput
        placeholder="Seu email"
        style={styles.textInput}
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        secureTextEntry={true}
        placeholder="Sua senha"
        style={styles.textInput}
        onChangeText={setSenha}
        value={senha}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>
          Não possui uma conta? <Text style={styles.cadastreSeText}>Cadastre-se!</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} activeOpacity={0.8}>
        <Text style={styles.btnText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Modal para exibir erros */}
      <Modal visible={errorModalVisible} transparent={true} animationType="fade">
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
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
  btnLogin: {
    width: '60%',
    height: 50,
    backgroundColor: '#00bff2',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
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
  linkText: {
    color: 'black',
    marginBottom: 30,
    fontSize: 16,
    textAlign: 'center',
  },
  cadastreSeText: {
    color: '#00bff2',
    fontWeight: 'bold',
  },
});
