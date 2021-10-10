import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/Feather';

import {Container,
	Header,
	HeaderTitle,
	UserName,
	ProfileButton,
	UserAvatar,
	ProvidersList,
	ProviderContainer,
	ProviderAvatar,
	ProviderInfo,
	ProviderName,
	ProviderMeta,
	ProviderMetaText,
	ProvidersListTitle
} from './styles';

export interface Provider{
	id: string;
	name: string;
	avatar_url: string;
}

const Dashboard: React.FC = () => {

	const [providers, setProviders] = useState<Provider[]>([]);

	const { signOut, user } = useAuth();
	const { navigate } = useNavigation();


	useEffect(() => {
		api.get('providers').then(response =>{
			setProviders(response.data)
		});
	});


	const navigateToProfile = useCallback(() =>{
		// navigate('Profile');
			signOut();
	}, [signOut]);

	const navigateToCreateAppointment = useCallback((providerId: string) =>{
		navigate('CreateAppointment', {providerId})
	}, [navigate])

	return (
		<Container>
			<Header>
				<HeaderTitle>
					Welcome, {"\n"}
					<UserName>{user.name}</UserName>
				</HeaderTitle>
					
					
				<ProfileButton onPress={navigateToProfile}>
					<UserAvatar source={{uri: user.avatar_url}} />
				</ProfileButton>
				
			</Header>
			<ProvidersList
				data = {providers}
				keyExtractor = {(provider) => provider.id}
				ListHeaderComponent = {
					<ProvidersListTitle>Providers List</ProvidersListTitle>
				}
				renderItem = {({item: provider}) => (
					<ProviderContainer onPress ={() => navigateToCreateAppointment(provider.id)}>
						
						<ProviderAvatar source ={{ uri: provider.avatar_url}} />
						
						<ProviderInfo>
							<ProviderName>{provider.name}</ProviderName>

							<ProviderMeta>
								<Icon name="calendar" size = {14} color="#ff9000" />
								<ProviderMetaText> Monday to Friday</ProviderMetaText>
							</ProviderMeta>

							<ProviderMeta>
								<Icon name="clock" size = {14} color="#ff9000" />
								<ProviderMetaText> 8AM to 6PM</ProviderMetaText>
							</ProviderMeta>
						</ProviderInfo>

					</ProviderContainer>
				)} 
			
			/>
		</Container>
	)
};

export default Dashboard;