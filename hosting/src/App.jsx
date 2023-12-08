import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import ota from "./assets/online-test-animate.svg";
//<img src={ota} className="logo" alt="Vite logo" />;

import "./App.css";
import { useRef, useState } from "react";

import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
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
import { render } from "react-dom";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
//import { wrap } from "@motionone/utils";

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

const URL = (url) => `http://localhost:3000/${url}`;

const GET = async (url = "") => {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
  return response.json();
};

const POST = async (url = "", data = {}) => {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return await response.json();
};

const sighInWithGoogle = async (user) => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  //await signInWithRedirect(auth, provider);
  await signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const res = await POST(URL("users"), {
      name: user.displayName,
      email: user.email,
    });
    let list = res[0];
    let item = list[0];
    localStorage.setItem("Id", item.Id);
  }
});

function App() {
  const [user] = useAuthState(auth);
  const [showChat, setShowChat] = useState(false);
  const [nav, setNav] = useState("Home");

  const [isOpen0, setIsOpen0] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);

  let quiz = nav === "Quiz" ? true : false;
  let stats = nav === "Stats" ? true : false;
  let wait = false;

  const [myInfo, setmyInfo] = useState("1");
  const [topUMC, settopUMC] = useState();
  const [topUHP, settopUHP] = useState();
  const [topQMC, settopQMC] = useState();
  const [topQHP, settopQHP] = useState();

  async function getStats() {
    const uid = localStorage.getItem("Id");

    // GET(URL("hints/U"));
    // GET(URL("hints/Q"));
    if (user)
      GET(URL(`answers/${uid}`)).then((response) => {
        let string;
        const list = response[0];
        const obj = list[0];
        string = (
          <>
            <div>
              ID: {obj.Id}
              <br></br>
              Name: {obj.name}
              <br></br>
              Email: {obj.email}
              <br></br>
              Questions answered: {obj.total_answers}
              <br></br>
              Correct answers: {obj.correct_answers}
              <br></br>
              Your Accuracy: {obj.accuracy_percentage}%<br></br>
            </div>
          </>
        );
        setmyInfo(string);
      });
    GET(URL("questions/m/c")).then((response) => {
      const list = response[0];
      let map = list.map((i) => (
        <>
          <br></br>
          Question #: {i.Q_id}
          <br></br>
          Correct Answers Count: {i.correct_answers_count}
          <br></br>
        </>
      ));

      settopQMC(map);
    });
    GET(URL("questions/h/p")).then((response) => {
      const list = response[0];
      let map = list.map((i) => (
        <>
          <br></br>
          Question #: {i.Q_id}
          <br></br>
          Total Answers: {i.total_users}
          <br></br>
          Average Accuracy: {i.correct_percentage}%<br></br>
        </>
      ));

      settopQHP(map);
    });
    GET(URL("users/m/c")).then((response) => {
      const list = response[0];
      let map = list.map((i) => (
        <>
          <br></br>
          User: {i.Id}
          <br></br>
          Name: {i.name}
          <br></br>
          Total Correct Answers: {i.correct_answer_count}
          <br></br>
        </>
      ));

      settopUMC(map);
    });
    GET(URL("users/h/p")).then((response) => {
      const list = response[0];
      let map = list.map((i) => (
        <>
          <br></br>
          User: {i.Id}
          <br></br>
          Name: {i.name}
          <br></br>
          Total Answers: {i.total_questions_answered}
          <br></br>
          Average Accuracy: {i.correct_percentage}%<br></br>
        </>
      ));
      settopUHP(map);
    });
  }

  async function GetQuestion() {
    const res = user
      ? await GET(URL(`questions/${localStorage.getItem("Id")}`))
      : await GET(URL("questions"));
    const question = res[0];
    document.getElementById("question").textContent = question[0].prompt;
    let obj = question[0];
    for (let i of "ABCDE") {
      document.getElementById(i).textContent = obj[i];
    }
    localStorage.setItem("questionAnswer", obj.answer + "");
    localStorage.setItem("qid", obj.Q_id + "");

    wait = false;
  }

  function checkAnswer(answer) {
    if (wait) return;
    wait = true;
    const qid = localStorage.getItem("qid");
    const storedA = localStorage.getItem("questionAnswer");
    const correct = answer === storedA;
    const answerClass = correct ? "correct" : "incorrect";
    document.getElementById(answer).classList.add(answerClass);
    document.getElementById(storedA).classList.add("correct");
    setTimeout(() => {
      document.getElementById(answer).classList.remove(answerClass);
      document.getElementById(storedA).classList.remove("correct");
      getNewQuestion();
    }, 3000);
    if (user) {
      POST(URL("answers/user"), {
        Q_id: qid,
        Id: localStorage.getItem("Id"),
        Answer: answer,
      }).then((ress) => console.log(ress));
    } else {
      POST(URL("answers"), { Q_id: qid, Answer: answer }).then((ress) =>
        console.log(ress)
      );
    }
  }

  async function getNewQuestion() {
    GetQuestion();
  }

  async function newHint() {
    if (wait) return;
    wait = true;
    const storedA = localStorage.getItem("questionAnswer");
    const uid = localStorage.getItem("Id");
    const qid = localStorage.getItem("qid");
    await POST(URL(user ? `hints/${localStorage.getItem("Id")}` : "hints"), {
      Q_id: qid,
      Id: user ? uid : "",
    });
    document.getElementById(storedA).classList.add("correct");
    setTimeout(() => {
      document.getElementById(storedA).classList.remove("correct");
      getNewQuestion();
    }, 3000);
  }

  return (
    <>
      <div className="App">
        {quiz ? (
          <div className="container">
            <div id="loader" className="hidden"></div>
            <div id="game" className="justify-center flex-column ">
              <div id="hud">
                <div id="hud-item">
                  <motion.div
                    className="btn logo"
                    whileHover={{ scale: [null, 1.1, 1.1] }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setNav("Home")}
                  >
                    Home
                  </motion.div>
                </div>
                <div id="hud-item">
                  <motion.div
                    className="btn logo"
                    whileHover={{ scale: [null, 1.1, 1.1] }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => newHint()}
                  >
                    Hint
                  </motion.div>
                </div>
                <div id="hud-item">
                  <motion.div
                    className="btn logo"
                    whileHover={{ scale: [null, 1.1, 1.1] }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => getNewQuestion()}
                  >
                    Next
                  </motion.div>
                </div>
              </div>
              <h2 id="question"></h2>
              <motion.div
                className="choice-container logo"
                whileHover={{ scale: [null, 1.05, 1.05] }}
                transition={{ type: "spring", stiffness: 400, damping: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => checkAnswer("A")}
              >
                <p className="choice-prefix">A</p>
                <p className="choice-text" data-number="1" id="A"></p>
              </motion.div>
              <motion.div
                className="choice-container logo"
                whileHover={{ scale: [null, 1.05, 1.05] }}
                transition={{ type: "spring", stiffness: 400, damping: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => checkAnswer("B")}
              >
                <p className="choice-prefix">B</p>
                <p className="choice-text" data-number="2" id="B"></p>
              </motion.div>
              <motion.div
                className="choice-container logo"
                whileHover={{ scale: [null, 1.05, 1.05] }}
                transition={{ type: "spring", stiffness: 400, damping: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => checkAnswer("C")}
              >
                <p className="choice-prefix">C</p>
                <p className="choice-text" data-number="3" id="C"></p>
              </motion.div>
              <motion.div
                className="choice-container logo"
                whileHover={{ scale: [null, 1.05, 1.05] }}
                transition={{ type: "spring", stiffness: 400, damping: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => checkAnswer("D")}
              >
                <p className="choice-prefix">D</p>
                <p className="choice-text" data-number="4" id="D"></p>
              </motion.div>
              <motion.div
                className="choice-container logo"
                whileHover={{ scale: [null, 1.05, 1.05] }}
                transition={{ type: "spring", stiffness: 400, damping: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => checkAnswer("E")}
              >
                <p className="choice-prefix">E</p>
                <p className="choice-text" data-number="5" id="E"></p>
              </motion.div>
            </div>
          </div>
        ) : stats ? (
          <div className="container">
            <motion.div
              className="btn logo"
              whileHover={{ scale: [null, 1.5, 1.4] }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => setNav("Home")}
            >
              Home
            </motion.div>
            <div id="highScores" className="flex-center flex-column">
              {user ? (
                <motion.div
                  layout
                  data-isOpen={isOpen0}
                  initial={{ borderRadius: 30 }}
                  className="parent logo"
                  onClick={() => setIsOpen0(!isOpen0)}
                  whileHover={{ scale: [null, 1.5, 1.4] }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  whileTap={{ scale: 0.8 }}
                >
                  {isOpen0 ? myInfo : "My Info!"}
                </motion.div>
              ) : (
                <></>
              )}
              <motion.div
                layout
                data-isOpen={isOpen1}
                initial={{ borderRadius: 30 }}
                className="parent logo"
                onClick={() => setIsOpen1(!isOpen1)}
                whileHover={{ scale: [null, 1.5, 1.4] }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                whileTap={{ scale: 0.8 }}
              >
                {isOpen1 ? <>{topQMC}</> : "Top-Questions"}
              </motion.div>
              <motion.div
                layout
                data-isOpen={isOpen2}
                initial={{ borderRadius: 30 }}
                className="parent logo"
                onClick={() => setIsOpen2(!isOpen2)}
                whileHover={{ scale: [null, 1.5, 1.4] }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                whileTap={{ scale: 0.8 }}
              >
                {isOpen2 ? <>{topQHP}</> : "Top-Questions %"}
              </motion.div>
              <motion.div
                layout
                data-isOpen={isOpen3}
                initial={{ borderRadius: 30 }}
                className="parent logo"
                onClick={() => setIsOpen3(!isOpen3)}
                whileHover={{ scale: [null, 1.5, 1.4] }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                whileTap={{ scale: 0.8 }}
              >
                {isOpen3 ? <>{topUMC}</> : "Top-Users"}
              </motion.div>
              <motion.div
                layout
                data-isOpen={isOpen4}
                initial={{ borderRadius: 30 }}
                className="parent logo"
                onClick={() => setIsOpen4(!isOpen4)}
                whileHover={{ scale: [null, 1.5, 1.4] }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                whileTap={{ scale: 0.8 }}
              >
                {isOpen4 ? <>{topUHP}</> : "Top-Users %"}
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            <div className="example-container">
              {user ? "Logged in as: " + user.displayName : ""}
            </div>
            <div className="container">
              <div id="home" className="flex-center flex-column">
                <h4>By Brand & Chuks</h4>
                <h2>Quick Ask</h2>
                <motion.div
                  className="btn logo"
                  whileHover={{ scale: [null, 1.5, 1.4] }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setNav("Quiz");
                    GetQuestion(); // if logged in get ruq
                  }}
                >
                  Quiz
                </motion.div>
                <motion.div
                  className="btn logo"
                  whileHover={{ scale: [null, 1.5, 1.4] }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setNav("Stats");
                    getStats();
                  }}
                >
                  Stats
                </motion.div>
                <motion.div
                  className="btn logo"
                  whileHover={{ scale: [null, 1.5, 1.4] }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={async () => {
                    if (!user) {
                      await sighInWithGoogle();
                    } else {
                      auth.signOut();
                    }
                  }}
                >
                  {user ? "Logout" : "Login"}
                </motion.div>
              </div>
            </div>
          </>
        )}
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
  return (
    <>
      <p className="read-the-docs">Login to Join Chat</p>
    </>
  );
}

function SignOut() {
  const signOut = () => {
    auth.signOut();
  };
  return auth.currentUser && <button onClick={signOut}>Logout</button>;
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
