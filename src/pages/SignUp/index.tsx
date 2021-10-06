import React, { useRef, useCallback } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View, TextInput, Alert } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import logoImg from '../../assets/logo.png';
import Button from '../../components/Button';
import Input from '../../components/Input';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';

import {
	Container,
	BackToSignIn,
	BackToSignInText,
	Title
} from './styles';

interface SignUpFormData {
	name: string;
	email: string;
	password: string;
}


const SignUp: React.FC = () => {

	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);

	const formRef = useRef<FormHandles>(null);
	const navigation = useNavigation();

	const handleSignUp = useCallback(
		async (data: SignUpFormData) => {
			try {
				formRef.current?.setErrors({});

				const schema = Yup.object().shape({
					name: Yup.string().required('Name is required'),
					email: Yup.string()
						.required('Email is required')
						.email('Please enter a valid email'),
					password: Yup.string().min(
						10,
						'Please enter at least 10 digits',
					),
				});

				await schema.validate(data, {
					abortEarly: false,
				});

				await api.post('/users', data);

				Alert.alert(
					'User registered successfully!',
					'You can log in now.',
				)
				
				navigation.goBack();

			} catch (err) {
				if (err instanceof Yup.ValidationError) {
					const errors = getValidationErrors(err);
					formRef.current?.setErrors(errors);

					return;
				}

				Alert.alert(
					'Register error',
					'Error on registering. Please try again!',
				)

			}
		}, [navigation]);

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
							<Title>Register</Title>
						</View>

						<Form ref={formRef} onSubmit={handleSignUp}>

							<Input
								name="name"
								icon="user"
								placeholder="Name"
								autoCapitalize="words"
								returnKeyType="next"
								onSubmitEditing={() => {
									emailInputRef.current?.focus()
								}}
							/>

							<Input
								ref={emailInputRef}
								name="email"
								icon="mail"
								placeholder="E-mail"
								keyboardType="email-address"
								autoCorrect={false}
								autoCapitalize="none"
								returnKeyType="next"
								onSubmitEditing={() => {
									passwordInputRef.current?.focus()
								}}
							/>

							<Input
								ref={passwordInputRef}
								name="password"
								icon="lock"
								placeholder="Password"
								secureTextEntry
								returnKeyType="send"
								onSubmitEditing={() => formRef.current?.submitForm()}
							/>

							<Button onPress={() => formRef.current?.submitForm()}>Register</Button>
						</Form>


					</Container>
				</ScrollView>


				<BackToSignIn onPress={() => navigation.goBack()}>
					<Icon name="arrow-left" size={20} color="#fff" />
					<BackToSignInText>Back to sign in</BackToSignInText>
				</BackToSignIn>
			</KeyboardAvoidingView>
		</>

	);
}

export default SignUp;