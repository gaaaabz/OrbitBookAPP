import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const { access_token, usuario } = await authService.register({
        nome: name.trim(),
        email: email.trim(),
        senha: password,
      });
      await signIn(access_token, usuario);
      router.replace('/destinations');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🚀 OrbitBook</Text>

        <Text style={styles.title}>Criar Conta</Text>

        <Text style={styles.subtitle}>
          Cadastre-se para explorar o universo
        </Text>

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCorrect={false}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Criar Conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já possui conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#111827',
    padding: 25,
    borderRadius: 20,
  },
  logo: {
    color: '#60A5FA',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#60A5FA',
    marginTop: 20,
  },
});
