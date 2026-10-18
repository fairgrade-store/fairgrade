import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,addDoc,serverTimestamp,query,where,onSnapshot,doc,updateDoc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const C=window.FIREBASE_CONFIG;
export const ready=!!(C&&C.apiKey&&C.apiKey.indexOf("PASTE")<0);
export let user=null;
let auth,db;
if(ready){const app=initializeApp(C);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth,u=>{user=u})}
export const onUser=cb=>ready?onAuthStateChanged(auth,cb):cb(null);
export const signIn=(e,p)=>signInWithEmailAndPassword(auth,e,p);
export const signUp=(e,p)=>createUserWithEmailAndPassword(auth,e,p);
export const logOut=()=>signOut(auth);
export const placeOrder=o=>addDoc(collection(db,"orders"),{...o,uid:auth.currentUser.uid,customerEmail:auth.currentUser.email,status:"pending",createdAt:serverTimestamp()});
export const myOrders=(cb,err)=>onSnapshot(query(collection(db,"orders"),where("uid","==",auth.currentUser.uid)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),err);
export const submitPayment=(id,ref,coin)=>updateDoc(doc(db,"orders",id),{status:"payment_submitted",payRef:ref,payCoin:coin||"",paidAt:serverTimestamp()});
export const addTicket=t=>addDoc(collection(db,"tickets"),{...t,uid:auth.currentUser.uid,email:auth.currentUser.email,status:"open",createdAt:serverTimestamp()});
export const myTickets=(cb,err)=>onSnapshot(query(collection(db,"tickets"),where("uid","==",auth.currentUser.uid)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),err);
export const getProfile=async()=>{const s=await getDoc(doc(db,"users",auth.currentUser.uid));return s.exists()?s.data():{}};
export const saveProfile=p=>setDoc(doc(db,"users",auth.currentUser.uid),p,{merge:true});
export const resetPassword=e=>sendPasswordResetEmail(auth,e);
export function walletBox(parent){
  (window.WALLETS||[]).forEach(w=>{
    const d=document.createElement("div");d.className="wl";
    const b=document.createElement("b");b.textContent=w.coin+" ("+w.net+")";
    const c=document.createElement("code");c.textContent=w.addr;
    const k=document.createElement("button");k.type="button";k.textContent="Copy address";
    k.onclick=()=>{navigator.clipboard.writeText(w.addr).then(()=>{k.textContent="Copied"}).catch(()=>{k.textContent="Press and hold the address to copy"})};
    d.append(b,c,k);parent.appendChild(d);
  });
}
