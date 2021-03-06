import React, {FC, useContext, useEffect, useState} from 'react';
import {Center} from '../../../components/center.component';
import {ActivityIndicator, Button, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {TextComponent} from '../../../components/text.component';
import {useDispatch, useSelector} from 'react-redux';
import {UIActions} from '../../../store/uiStore/uistore.actions';
import {useNavigation} from '@react-navigation/native'
import {ThemeContext} from '../../../providers/theme.provider';
import {AuthContext} from '../../../providers/auth.provider';
import {Ionicons} from '@expo/vector-icons';
import {DarkColors, LightColors} from '../../../styles/colors';
import {UserActions} from '../../../store/user/user.actions';
import {UserSelectors} from '../../../store/user/user.selectors';

export const ProfileScreen: FC = () => {

    const navigation = useNavigation()
    const dispatch = useDispatch()

    // Context
    const {theme} = useContext(ThemeContext)
    const {user, logout} = useContext(AuthContext)

    // Selectors
    const userModel = useSelector(UserSelectors.getUser)
    const fullName = useSelector(UserSelectors.getFullName)
    const isLoading = useSelector(UserSelectors.isLoading)

    // Effects
    useEffect(() => {
        // Fetch User
        dispatch(UserActions.fetchUser())
    },[])

    const styles = StyleSheet.create({
        header: {
            paddingHorizontal: theme.spacing.XL,
            paddingVertical: 50,
            alignItems: "center",
            justifyContent: "space-around",
        },
        avatar: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#555",
            marginBottom: theme.spacing.LG,
        },
        body: {
            padding: theme.spacing.LG
        }
    })

    if(isLoading){
        return (
            <Center>
                <ActivityIndicator />
            </Center>
        )
    }

    return (
        <ScrollView>
            <View>
                <SafeAreaView style={{backgroundColor: theme.colors.FILL_TERTIARY}}>
                    <View style={styles.header}>
                        <View style={styles.avatar}>
                            <Center>
                            <Ionicons name={"person"} size={40} color={DarkColors.SECONDARY}/>
                            </Center>
                        </View>
                        <TextComponent style={theme.fonts.HEADLINE}>{user?.email}</TextComponent>
                        {
                            fullName && <TextComponent style={theme.fonts.HEADLINE}>{fullName}</TextComponent>
                        }
                    </View>
                </SafeAreaView>
                <View style={styles.body}>
                    <Button title={"Login"} onPress={() => navigation.navigate("LoginModal")}/>
                    <Button title={"Logout"} onPress={() => logout()} color={"red"}/>
                </View>
            </View>
        </ScrollView>
    )
}
