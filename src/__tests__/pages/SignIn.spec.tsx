import React from 'react';
import { render } from 'react-native-testing-library';

import SignIn from '../../pages/SignIn';

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native-iphone-x-helper', () => {
  return {
    getBottomSpace: () => {
      return 1;
    },
  };
});

describe('SignIn page', () => {
  it('should contains email/password inputs', () => {
    const { getByPlaceholder } = render(<SignIn />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Password')).toBeTruthy();
  });
});
