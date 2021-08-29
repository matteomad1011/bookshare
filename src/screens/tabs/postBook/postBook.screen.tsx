import React, {FC, useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
    Alert,
    Button,
    Keyboard, Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {Center} from '../../../components/center.component';
import {TextComponent} from '../../../components/text.component';
import {TextInputComponent} from '../../../components/textInput.component';
import {ThemeContext} from '../../../providers/theme.provider';
import {NativeStackScreenProps} from 'react-native-screens/native-stack';
import {TabsScreens} from '../../../navigators/tabs.navigator';
import {ButtonComponent} from '../../../components/button.component';
import {Ionicons} from '@expo/vector-icons';
import IsbnScanner from "../../../components/isbnScanner.component";
import {PickerSelector} from "../../../components/pickerSelector.component";
import {BookPost} from '../../../model/bookPost.model';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid'
import {UserModel} from '../../../model/user.model';
import {useAppDispatch, useAppSelector} from '../../../store/store.config';
import {PostNewBookActions} from '../../../store/postBook/postBook.actions';
import {FBAuth} from '../../../firebase/firebase.config';
import {GoogleBookAPIService} from '../../../services/googleBookAPI.service';

type Props = NativeStackScreenProps<TabsScreens, "PostBook">

export const PostBookScreen: FC<Props> = ({navigation}) => {

    const dispatch = useAppDispatch()
    const {theme} = useContext(ThemeContext)

    // Selectors
    const googleBookData = useAppSelector(state => state.newBook.googleBook)
    const isLoading = useAppSelector(state => state.newBook.isLoading)

    // UI
    const [canPublish, setCanPublish] = useState(false)
    const [isbnModal, setIsbnModal] = useState(false)

    // Form Data
    const [isbn, setIsbn] = useState("")
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [description, setDescription] = useState("")
    const [conditions, setConditions] = useState("")
    const [selectedPrice, setSelectedPrice] = useState("")
    const [position, setPosition] = useState("")
    const [phone, setPhone] = useState("")


    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Post a book",
            headerLeft: props => <Button title={"Annulla"} onPress={navigation.goBack} color={props.tintColor}/>,
            //headerRight: props => <Button title={"Pubblica"} disabled={!canPublish} onPress={() => handlePublishBook()} color={props.tintColor}/>
        })
    }, [])

    useEffect(() => {
        if (
            isbn.length == 0 ||
            title.length == 0 ||
            description.length == 0 ||
            selectedPrice.length == 0 ||
            conditions.length == 0 ||
            position.length == 0
        ) {
            // :todo set this to true while debugging
            setCanPublish(true)
        } else {
            setCanPublish(true)
        }

    }, [isbn, title, author, description, conditions, selectedPrice, position, phone])


    function handlePublishBook() {
        Alert.alert("Confermi?", "Il tuo libro sarà visibile a tutti pubblicamente.", [
            {text: "OK", onPress: publishBook},
            {text: "Annulla", style: "destructive"}
        ])
    }

    function publishBook() {
        const newBook: BookPost = {
            bookId: googleBookData?.id || null,
            title: title,
            description: description,
            price: Number(selectedPrice) || 0,
            condition: conditions,
            phone: phone,
            position: {
                city: "Rome",
                latitude: 41,
                longitude: 12
            },
            active: true
        }

        // Dispatching action to upload the new book
        dispatch(PostNewBookActions.postNewBook(newBook))
            .unwrap()
            .then(result => {
                console.log("Book posted successfully.")
                navigation.navigate("HomeNavigator")
            })
            .catch(e => {
                console.log("Book hasn't been posted.", e.message)
                Alert.alert("Problema con il caricamento", e.message)
            })
    }


    /**
     * Handling Google book autocompletion
     */
    useEffect(() => {
        if(isbn.length == 10 || isbn.length == 13) {
            dispatch(PostNewBookActions.fetchBookByIsbn(isbn))
        }
    }, [isbn])

    useEffect(() => {
        if(googleBookData){
            setTitle(googleBookData.volumeInfo.title || "Nessun titolo disponibile")
            setAuthor(googleBookData.volumeInfo.authors?.join(", ") || "Nessun autore disponibile")
            setDescription(googleBookData.volumeInfo.description || "Nessuna descrizione disponibile")
        }
    },[googleBookData])

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: theme.spacing.LG
        },
        title: {},
        section: {
            marginTop: theme.spacing.MD
        },
        sectionHeader: {
            color: theme.colors.SECONDARY,
            marginBottom: theme.spacing.S
        },
        inputFooter: {
            color: theme.colors.SECONDARY
        },
        imageContainer: {
            borderRadius: theme.spacing.LG,
            borderColor: theme.colors.FILL_TERTIARY,
            borderWidth: 1,
            padding: theme.spacing.LG,
            minHeight: 120
        },
        buttonImages: {
            color: theme.colors.ACCENT,
            marginLeft: theme.spacing.S
        },
        imagesDescription: {
            marginTop: theme.spacing.MD,
            color: theme.colors.SECONDARY
        }
    })

    return (
        <SafeAreaView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={styles.container}>
                        <TextComponent style={[theme.fonts.LARGE_TITLE, styles.title]}>Posta un
                            libro</TextComponent>
                        <View style={styles.section}>
                            <TouchableOpacity style={[styles.imageContainer]}
                                              onPress={() => alert("Carica foto")}>
                                <Center>
                                    <View style={{flexDirection: "row", alignItems: "center"}}>
                                        <Ionicons name={"image"} color={theme.colors.ACCENT} size={24}/>
                                        <TextComponent style={[theme.fonts.HEADLINE, styles.buttonImages]}>Carica le
                                            foto</TextComponent>
                                    </View>
                                    <TextComponent style={[theme.fonts.CAPTION, styles.imagesDescription]}>Aggiungi
                                        fino a 5 foto.
                                        Avrai più possibità di vendere</TextComponent>
                                </Center>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.section}>
                            <TextComponent
                                style={[styles.sectionHeader, theme.fonts.SECTION_HEADER]}>IDENTIFICATIVO</TextComponent>
                            <TextInputComponent
                                value={isbn}
                                placeholder={"ISBN"}
                                onChangeText={setIsbn}
                                endItem={
                                    <Ionicons name={"qr-code-outline"} color={theme.colors.ACCENT} size={25}
                                              onPress={() => setIsbnModal(true)}/>
                                }
                            />
                            <TextComponent
                                style={[theme.fonts.CAPTION, styles.inputFooter]}>Solitamente di 10 o 13 cifre. E
                                il codice che identifica
                                ogni libro. Scrivilo oppure scansionalo premendo sul QRCode.</TextComponent>
                        </View>

                        <View style={styles.section}>
                            <TextComponent
                                style={[styles.sectionHeader, theme.fonts.SECTION_HEADER]}>DETTAGLI</TextComponent>
                            <TextInputComponent placeholder={"Titolo"}
                                                onChangeText={setTitle}
                                                value={title}
                                                startItem={<Ionicons name={"book-outline"} size={theme.spacing.XL}
                                                                     color={theme.colors.SECONDARY}/>}
                            />
                            <TextInputComponent placeholder={"Autore"}
                                                onChangeText={setAuthor}
                                                value={author}
                                                startItem={<Ionicons name={"person-circle-outline"}
                                                                     size={theme.spacing.XL}
                                                                     color={theme.colors.SECONDARY}/>}
                            />
                            <TextInputComponent placeholder={"Descrizione"}
                                                onChangeText={setDescription}
                                                value={description}
                                                startItem={<Ionicons name={"help-circle-outline"}
                                                                     size={theme.spacing.XL}
                                                                     color={theme.colors.SECONDARY}/>}
                            />
                            <TextComponent
                                style={[theme.fonts.CAPTION, styles.inputFooter]}>Descrivi il libro e le sue
                                condizioni. Una descrizione
                                accurata ti da più possibilità di vendere.</TextComponent>
                        </View>

                        <View style={styles.section}>
                            <TextComponent
                                style={[styles.sectionHeader, theme.fonts.SECTION_HEADER]}>ANNUNCIO</TextComponent>
                            {/*TODO: implement price validation*/}
                            <TextInputComponent placeholder={"Prezzo"}
                                                keyboardType={"decimal-pad"}
                                                onChangeText={setSelectedPrice}
                                                value={selectedPrice}
                                                endItem={<Ionicons name={"logo-euro"} size={theme.spacing.LG}
                                                                   color={theme.colors.SECONDARY}/>}
                            />
                            {/*TODO: Abbellire in caso come da figma*/}
                            <PickerSelector
                                onValueChange={(value) => setConditions(value)}
                                placeholder={{
                                    label: "Seleziona lo stato di usura",
                                    value: "",
                                    inputLabel: "Condizione"
                                }}
                                items={[
                                    {label: 'Nuovo', value: 'nuovo'},
                                    {label: 'Usato come nuovo', value: 'usato_come_nuovo'},
                                    {label: 'Usato', value: 'usato'},
                                    {label: 'Molto rovinato', value: 'molto_rovinato'},
                                ]}
                            />
                        </View>

                        <View style={styles.section}>
                            <TextComponent
                                style={[styles.sectionHeader, theme.fonts.SECTION_HEADER]}>Posizione</TextComponent>
                            <TextInputComponent placeholder={"Posizione"}
                                                onChangeText={setPosition}
                                                value={position}
                                                startItem={<Ionicons name={"locate-outline"} size={theme.spacing.XL}
                                                                     color={theme.colors.SECONDARY}/>}
                            />
                        </View>

                        {/*TODO: implementare keyboard avoidance*/}
                        <View style={styles.section}>
                            <TextComponent
                                style={[styles.sectionHeader, theme.fonts.SECTION_HEADER]}>Contatti</TextComponent>
                            <TextInputComponent placeholder={"Telefono"}
                                                keyboardType={"phone-pad"}
                                                onChangeText={setPhone}
                                                value={phone}
                                                startItem={<Ionicons name={"call-outline"} size={theme.spacing.XL}
                                                                     color={theme.colors.SECONDARY}/>}

                            />
                        </View>

                        <View style={styles.section}>
                            <ButtonComponent onPress={handlePublishBook} loading={isLoading}
                                             disabled={!canPublish}>Pubblica</ButtonComponent>
                            <TextComponent style={[styles.inputFooter, theme.fonts.CAPTION]}>Al momento della
                                pubblicazione tutti gli annunci sono sottoposto a un rapido controllo standard per
                                assicurarci che rispettino le nostre Normative sulle vendite prima di diventare visibili
                                agli altri. Beni diversi dai libri non sono consentiti.</TextComponent>
                        </View>

                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>

            <Modal presentationStyle={"pageSheet"} visible={isbnModal} animationType={"slide"}>
                <View style={{flex: 1}}>
                    <IsbnScanner setIsbnModal={setIsbnModal} onIsbnScanned={setIsbn}/>
                    <SafeAreaView>
                        <Button title={"Annulla Scansione"} onPress={() => setIsbnModal(false)}/>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    )
}
