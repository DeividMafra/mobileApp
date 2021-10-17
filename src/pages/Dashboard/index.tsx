import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import {
  Container,
  Header,
  HeaderTitle,
  ProfileButton,
  ProviderAvatar,
  ProviderContainer,
  ProviderInfo,
  ProviderMeta,
  ProviderMetaText,
  ProviderName,
  ProvidersList,
  ProvidersListTitle,
  UserAvatar,
  UserName,
} from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });
  }, []);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigation.navigate('CreateAppointment', { providerId });
    },
    [navigation],
  );

  const navigateToProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Welcome, {'\n'}
          <UserName>{user.name}</UserName>
        </HeaderTitle>

        {/* <ProfileButton onPress={() => navigation.navigate('Profile')}> */}
        <ProfileButton onPress={navigateToProfile}>
          <UserAvatar source={{ uri: user.avatar_url }} />
        </ProfileButton>
      </Header>

      <ProvidersList
        data={providers}
        keyExtractor={(provider) => provider.id}
        ListHeaderComponent={
          <ProvidersListTitle>Providers List</ProvidersListTitle>
        }
        renderItem={({ item: provider }) => (
          <ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            <ProviderAvatar source={{ uri: provider.avatar_url }} />

            <ProviderInfo>
              <ProviderName>{provider.name}</ProviderName>
              <ProviderMeta>
                <Icon name="calendar" size={14} color="#ff9000" />
                <ProviderMetaText> Monday to Friday</ProviderMetaText>
              </ProviderMeta>

              <ProviderMeta>
                <Icon name="clock" size={14} color="#ff9000" />
                <ProviderMetaText> 8AM to 6PM</ProviderMetaText>
              </ProviderMeta>
            </ProviderInfo>
          </ProviderContainer>
        )}
      />
    </Container>
  );
};

export default Dashboard;
