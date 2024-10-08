import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Image } from 'react-native';
import { useState } from 'react';
import { initializeApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  UserCredential,
  getReactNativePersistence
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';

// REASON TO USE ENVIRONMENT VARIABLES
// 1. Not uploading API keys / IDs of any sort into a repo
// 2. Data might change depending on your dev environment 
// -- api keys
// -- server URLs
// -- any other sort of credentials / validation 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
/*
const auth = initializeAuth(
  app,
  {persistence: getReactNativePersistence(ReactNativeAsyncStorage)}
);
*/
export default function App() {

  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const[name, setName] = useState("");
  const[breed, setBreed] = useState("");

  onAuthStateChanged(auth, user => {
    if(user) {
      console.log("THE USER IS VALIDATED: " + user.email);
    } else {
      console.log("LOGGED OUT");
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <TextInput
        placeholder='email'
        onChangeText={text => {
          setEmail(text);
        }}
      />
      <TextInput
        placeholder='password'
        secureTextEntry={true}
        onChangeText={text => {
          setPassword(text);
        }}
      />
      <Button 
        title="sign up"
        onPress={() => {

          // this method returns a Promise (as some async methods do)
          createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential : UserCredential) => {
            // this will run when the promise is solved
            console.log("USER: " + userCredential.user.email);
          })
          .catch((error : any) => {
            if(error.code == "auth/weak-password") {
              alert("THAT PASSWORD IS SUPER CRAPPY!");
            }
            console.log("ERROR: " + error.message +  " " + error.code);
          });
        }}
      />
      <Button 
        title="log in"
        onPress={() => {
          signInWithEmailAndPassword(auth, email, password)
          .then((userCredential : UserCredential) => {
            console.log(userCredential.user.email);
          })
          .catch((error : any) => {
            console.log("ERROR: " + error.message + " " + error.code);
          });
        }}
      />
      <Button 
        title="log out"
        onPress={() => {
          console.log("LOGGING OUT");
          auth.signOut();
        }}
      />
      <TextInput
        placeholder='name'
        onChangeText={text => {
          setName(text);
        }}
      />
      <TextInput
        placeholder='breed'
        onChangeText={text => {
          setBreed(text);
        }}
      />
      <Button 
        title="add"
        onPress={async () =>{

          try {

            // try code block
            // code that might be risky can be run within a try code block
            // risky means that it can raise an exception
            // intention is to deal with exceptions gracefully
            // (fail gracefully)
            // https://en.wikipedia.org/wiki/Graceful_exit

            // how is data arranged in firestore?
            // collection - is a set of documents
            // can think of it as a "table" in relational db
            // documents - think of them as rows in a table

            // get a reference to the collection
            var perritosCollection = collection(db, "perritos");

            const newDoc = await addDoc(
              perritosCollection,
              {
                name: name,
                breed: breed
              }
            );

            console.log("ID of the new perrito: " + newDoc.id);

          }catch(e){
            console.log("EXCEPTION WHEN TRYING TO ADD AN ANIMAL: " + e);
          }
        }}
      />
      <Button 
        title="get all"
        onPress={async () => {
          var snapshot = await getDocs(collection(db, "perritos"));
          snapshot.forEach(currentDocument => {
            console.log(currentDocument.data());
          });
        }}
      />
      <Button 
        title="query"
        onPress={async () =>{}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
