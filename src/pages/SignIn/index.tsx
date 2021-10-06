import React, { useCallback, useRef } from 'react';
import { Image, KeyboardAvoidingView, Platform, View, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import Icon from 'react-native-vector-icons/Feather'
import logoImg from '../../assets/logo.png';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import { useAuth } from '../../hooks/auth';

import {
	Container,
	Title,
	ForgotPassword,
	ForgotPasswordText,
	CreateAccountButton,
	CreateAccountButtonText
} from './styles';

interface SignInFormDate {
	email: string;
	password: string;
}

const SignIn: React.FC = () => {

	const passwordInputRef = useRef<TextInput>(null);

	const formRef = useRef<FormHandles>(null);

	const navigation = useNavigation();

	const { signIn } = useAuth();

	const handleSignIn = useCallback(
		async (data: SignInFormDate) => {
			formRef.current?.setErrors({});

			try {
				const schema = Yup.object().shape({
					email: Yup.string()
						.required('Email is required')
						.email('Please enter a valid email'),
					password: Yup.string().required('Password is required'),
				});
				await schema.validate(data, {
					abortEarly: false,
				});

				await signIn({
					email: data.email,
					password: data.password,
				});

			} catch (err) {
				if (err instanceof Yup.ValidationError) {
					const errors = getValidationErrors(err);
					formRef.current?.setErrors(errors);

					return;
				}

				Alert.alert(
					'Login error',
					'Error on login. Please check your credentials!',
				)
			}
		},[signIn]);

	return (
		<>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				enabled
			>
				<ScrollView
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{ flex: 1 }}
				>
					<Container>
						<Image source={logoImg} />
						<View>
							<Title>Logon</Title>
						</View>

						<Form ref={formRef} onSubmit={handleSignIn}>

							<Input
								autoCorrect={false}
								autoCapitalize="none"
								keyboardType="email-address"
								name="email"
								icon="mail"
								placeholder="E-mail"
								onSubmitEditing={() => {
									passwordInputRef.current?.focus();
								}}
								returnKeyType="next"
							/>


							<Input
								ref={passwordInputRef}
								onSubmitEditing={() => {
									formRef.current?.submitForm();
								}}
								secureTextEntry
								returnKeyType="send"
								name="password"
								icon="lock"
								placeholder="Password"
							/>

							<Button
								onPress={() => {
									formRef.current?.submitForm();
								}}
							>
								Logon
							</Button>

						</Form>

						<ForgotPassword onPress={() => { }}>
							<ForgotPasswordText>Forget my password</ForgotPasswordText>
						</ForgotPassword>
					</Container>
				</ScrollView>


				<CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
					<Icon name="log-in" size={20} color="#ff9000" />
					<CreateAccountButtonText>Create an account</CreateAccountButtonText>
				</CreateAccountButton>
			</KeyboardAvoidingView>
		</>

	);
}

export default SignIn;