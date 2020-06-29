import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import firebaseInit from './firebaseInit'

firebase.initializeApp(firebaseInit)

export const db = firebase.firestore()
export const auth = firebase.auth()
