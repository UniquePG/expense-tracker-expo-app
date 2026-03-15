import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Text, useTheme, Snackbar, Avatar as PaperAvatar} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {profileSchema} from '../../utils/validationSchemas';
import {useUserStore} from '../../store/userStore';
import {userApi} from '../../api/userApi';
import {ScreenWrapper} from '../../components/ui/ScreenWrapper';
import {Header} from '../../components/ui/Header';
import {InputField} from '../../components/inputs/InputField';
import {SelectField} from '../../components/inputs/SelectField';
import {Button} from '../../components/buttons/Button';
import {LoadingOverlay} from '../../components/ui/LoadingOverlay';
import {CURRENCIES} from '../../constants/constants';
import * as ImagePicker from 'expo-image-picker';

export const EditProfileScreen = ({navigation}) => {
  const theme = useTheme();
  const {profile, updateProfile, uploadAvatar, isLoading, updateSuccess, clearUpdateSuccess} = useUserStore();
  const [error, setError] = useState(null);
  const [avatar, setAvatar] = useState(profile?.avatar || null);

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      currency: profile?.currency || 'USD',
    },
  });

  const requestPermission = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setAvatar(asset.uri);
        
        const imageFile = {
          uri: asset.uri,
          type: 'image/jpeg',
          fileName: asset.fileName || 'avatar.jpg',
        };
        
        await uploadAvatar(imageFile);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      setError('Failed to upload avatar');
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      await updateProfile(data);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const currencyOptions = CURRENCIES.map(c => ({
    label: `${c.name} (${c.symbol})`,
    value: c.code,
  }));


  return (
    <ScreenWrapper safeArea={true}>
      <Header
        title="Edit Profile"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleImagePick}>
            {avatar ? (
              <PaperAvatar.Image
                size={100}
                source={{uri: avatar}}
                style={styles.avatar}
              />
            ) : (
              <PaperAvatar.Text
                size={100}
                label={`${profile?.firstName?.[0]}${profile?.lastName?.[0]}`}
                style={[styles.avatar, {backgroundColor: theme.colors.primary}]}
              />
            )}
            <View style={[styles.cameraBadge, {backgroundColor: theme.colors.primary}]}>
              <Text style={styles.cameraText}>Change</Text>
            </View>
          </TouchableOpacity>

          <Controller
            control={control}
            name="firstName"
            render={({field: {onChange, value}}) => (
              <InputField
                label="First Name"
                value={value}
                onChangeText={onChange}
                leftIcon="account"
                error={errors.firstName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Last Name"
                value={value}
                onChangeText={onChange}
                leftIcon="account"
                error={errors.lastName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Email"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email"
                error={errors.email?.message}
                disabled={true} // Email usually can't be changed directly
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({field: {onChange, value}}) => (
              <InputField
                label="Phone (Optional)"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                leftIcon="phone"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="currency"
            render={({field: {onChange, value}}) => (
              <SelectField
                label="Default Currency"
                value={value}
                options={currencyOptions}
                onSelect={onChange}
                error={errors.currency?.message}
              />
            )}
          />

          <Button
            title="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isLoading} message="Saving..." />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        action={{label: 'Dismiss', onPress: () => setError(null)}}>
        {error}
      </Snackbar>

      <Snackbar
        visible={updateSuccess}
        onDismiss={clearUpdateSuccess}
        duration={2000}
        style={{backgroundColor: theme.colors.success}}>
        Profile updated successfully!
      </Snackbar>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    elevation: 4,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cameraText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 24,
  },
});