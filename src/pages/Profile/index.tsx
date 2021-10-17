import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import {
  CameraOptions,
  ImageLibraryOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Dialog } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import * as Yup from 'yup';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import {
  BackButton,
  Container,
  Title,
  UserAvatar,
  UserAvatarButton,
  dialogButton,
  DialogButton,
  DialogButtonText,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [visible, setVisible] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const optionsImageLibrary: ImageLibraryOptions = {
    mediaType: 'photo',
    quality: 0.5,
  };

  const optionsCameraOptions: CameraOptions = {
    mediaType: 'photo',
    quality: 0.5,
    cameraType: 'front',
    saveToPhotos: false,
  };

  const toggleAvatarDialog = useCallback(() => {
    setVisible((state) => !state);
  }, []);

  const handleOpenImageLibrary = useCallback(() => {
    launchImageLibrary(optionsImageLibrary, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Authorization',
            'Please check your settings for permitting GoBabber access your photo gallery!',
          );
        }
      }

      const data = new FormData();

      if (response.assets) {
        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.assets[0].uri,
        });
      }

      api.patch('users/avatar', data).then((apiResponse) => {
        updateUser(apiResponse.data);
      });
    });

    setVisible(false);
  }, [optionsImageLibrary, user.id, updateUser]);

  const handleOpenCamera = useCallback(() => {
    launchCamera(optionsCameraOptions, (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Authorization',
            'Please check your settings for permitting GoBabber access your camera!',
          );
        }
      }

      const data = new FormData();

      if (response.assets) {
        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.assets[0].uri,
        });
      }

      api.patch('users/avatar', data).then((apiResponse) => {
        updateUser(apiResponse.data);
      });
    });

    setVisible(false);
  }, [optionsCameraOptions, updateUser, user.id]);

  const handleProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Name is required'),
          email: Yup.string()
            .required('Email is required')
            .email('Please enter a valid email'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (value) => !!value.length,
            then: Yup.string()
              .required('Required field')
              .min(10, 'Please enter at least 10 digits'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (value) => !!value.length,
              then: Yup.string().required('Required field'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), null], 'Password must match'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { name, email, old_password, password, password_confirmation } =
          data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Profile updated successfully!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert('Update error', 'Error on updating. Please try again!');
      }
    },
    [navigation, updateUser],
  );

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
            <BackButton onPress={handleGoBack}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={toggleAvatarDialog}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>My Profile</Title>
            </View>

            <Form initialData={user} ref={formRef} onSubmit={handleProfile}>
              <Input
                name="name"
                icon="user"
                placeholder="Name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
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
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Current Password"
                secureTextEntry
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />

              <Input
                ref={newPasswordInputRef}
                name="password"
                icon="lock"
                placeholder="New Password"
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              />

              <Input
                ref={confirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirm New Password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={() => formRef.current?.submitForm()}
              />

              <Button onPress={() => formRef.current?.submitForm()}>
                Update
              </Button>

              <Dialog visible={visible} onDismiss={toggleAvatarDialog}>
                <Dialog.Content
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}
                >
                  <DialogButton onPress={handleOpenImageLibrary}>
                    <Icon name="image" size={36} color="#ff9000" />
                    <DialogButtonText>Library</DialogButtonText>
                  </DialogButton>

                  <DialogButton onPress={handleOpenCamera}>
                    <Icon name="camera" size={36} color="#ff9000" />
                    <DialogButtonText>Camera</DialogButtonText>
                  </DialogButton>
                </Dialog.Content>
              </Dialog>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
