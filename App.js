// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Cadastro from './screens/Cadastro';
import Login from './screens/Login';
import Home from './screens/Home';

const Stack = createStackNavigator();

export default function App() {
  return (
<NavigationContainer>
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen 
      name="Login" 
      component={Login} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Cadastro" 
      component={Cadastro} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Home" 
      component={Home} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
</NavigationContainer>
  );
}
