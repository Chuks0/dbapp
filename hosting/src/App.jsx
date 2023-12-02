import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

import "./App.css";
import { useRef, useState } from "react";

import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  collection,
  getFirestore,
  orderBy,
  limit,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const firebaseConfig = {
  apiKey: "AIzaSyAHsUhPfPx2MhAw9yODNIJwN7zUWkpYA4w",
  authDomain: "quickaskserver.firebaseapp.com",
  projectId: "quickaskserver",
  storageBucket: "quickaskserver.appspot.com",
  messagingSenderId: "8235628199",
  appId: "1:8235628199:web:f3b8646d7834ca0f1c8d82",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="App">
        <div className="Chat">
          <button
            className="chat-btn logo"
            onClick={() => setShowChat(!showChat)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              width="31.25"
              viewBox="0 0 640 512"
            >
              <path d="M208 352c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176c0 38.6 14.7 74.3 39.6 103.4c-3.5 9.4-8.7 17.7-14.2 24.7c-4.8 6.2-9.7 11-13.3 14.3c-1.8 1.6-3.3 2.9-4.3 3.7c-.5 .4-.9 .7-1.1 .8l-.2 .2 0 0 0 0C1 327.2-1.4 334.4 .8 340.9S9.1 352 16 352c21.8 0 43.8-5.6 62.1-12.5c9.2-3.5 17.8-7.4 25.3-11.4C134.1 343.3 169.8 352 208 352zM448 176c0 112.3-99.1 196.9-216.5 207C255.8 457.4 336.4 512 432 512c38.2 0 73.9-8.7 104.7-23.9c7.5 4 16 7.9 25.2 11.4c18.3 6.9 40.3 12.5 62.1 12.5c6.9 0 13.1-4.5 15.2-11.1c2.1-6.6-.2-13.8-5.8-17.9l0 0 0 0-.2-.2c-.2-.2-.6-.4-1.1-.8c-1-.8-2.5-2-4.3-3.7c-3.6-3.3-8.5-8.1-13.3-14.3c-5.5-7-10.7-15.4-14.2-24.7c24.9-29 39.6-64.7 39.6-103.4c0-92.8-84.9-168.9-192.6-175.5c.4 5.1 .6 10.3 .6 15.5z" />
            </svg>
          </button>
          {showChat ? (
            <section className="chat-popup">
              <SignOut />
              {user ? <ChatRoom /> : <SignIn />}
            </section>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

function SignIn() {
  const sighInWithGoogle = async (user) => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    //await signInWithRedirect(auth, provider);
    await signInWithPopup(auth, provider);
  };
  return (
    <>
      <button onClick={sighInWithGoogle} className="sign-in">
        Sign in with Google
      </button>
      <p className="read-the-docs">SignIn to Join Chat</p>
    </>
  );
}

function SignOut() {
  const signOut = () => {
    auth.signOut();
  };
  return auth.currentUser && <button onClick={signOut}>Sign Out</button>;
}

function ChatRoom() {
  const botRef = useRef();
  const messageRef = collection(firestore, "message");
  const q = query(messageRef, orderBy("createdAt", "desc"), limit(25));
  const [message] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormVlaue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await addDoc(messageRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });
    setFormVlaue("");
    botRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div className="chat-area" id="0101">
        {message &&
          message
            .reverse()
            .map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={botRef}></div>
      </div>

      <form onSubmit={sendMessage} className="input-area">
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormVlaue(e.target.value)}
        />
        <button type="submit" disabled={!formValue} className="submit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="16"
            width="16"
            viewBox="0 0 512 512"
          >
            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
          </svg>
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "out-msg" : "income-msg";
  const myMsg = uid === auth.currentUser.uid;
  return (
    <>
      <div className={`${messageClass}`}>
        {myMsg ? <p className="my-msg">{text}</p> : <></>}
        <img
          className="avatar"
          src={photoURL ? photoURL : "../public/undraw_smiley.svg"}
          alt="Profile Picture"
        />
        {myMsg ? <></> : <p className="msg">{text}</p>}
      </div>
    </>
  );
}

export default App;
