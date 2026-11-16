import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup,getAdditionalUserInfo} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,addDoc,serverTimestamp,query,where,onSnapshot,doc,updateDoc,getDoc,setDoc,increment,getDocs} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const C=window.FIREBASE_CONFIG;
export const ready=!!(C&&C.apiKey&&C.apiKey.indexOf("PASTE")<0);
export let user=null;
let auth,db;
if(ready){const app=initializeApp(C);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth,u=>{user=u})}
export const onUser=cb=>ready?onAuthStateChanged(auth,cb):cb(null);
const mark=(r,extra)=>{setDoc(doc(db,"users",r.user.uid),{email:r.user.email,lastLogin:serverTimestamp(),...extra},{merge:true}).catch(()=>{});return r};
export const signIn=(e,p)=>signInWithEmailAndPassword(auth,e,p).then(r=>mark(r,{}));
export const googleSignIn=()=>signInWithPopup(auth,new GoogleAuthProvider()).then(r=>{const nu=getAdditionalUserInfo(r).isNewUser;return mark(r,nu?{createdAt:serverTimestamp(),name:r.user.displayName||""}:{})});
export const getAds=()=>getDocs(query(collection(db,"ads"),where("active","==",true))).then(s=>s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0)));
export const signUp=(e,p,name)=>createUserWithEmailAndPassword(auth,e,p).then(r=>mark(r,{createdAt:serverTimestamp(),...(name?{name}:{})}));
export const logOut=()=>signOut(auth);
export const placeOrder=o=>addDoc(collection(db,"orders"),{...o,uid:auth.currentUser.uid,customerEmail:auth.currentUser.email,sid:window.__sid||"",status:"pending",createdAt:serverTimestamp()});
export const myOrders=(cb,err)=>onSnapshot(query(collection(db,"orders"),where("uid","==",auth.currentUser.uid)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),err);
export const submitPayment=(id,ref,coin)=>updateDoc(doc(db,"orders",id),{status:"payment_submitted",payRef:ref,payCoin:coin||"",paidAt:serverTimestamp()});
export const addTicket=t=>addDoc(collection(db,"tickets"),{...t,uid:auth.currentUser.uid,email:auth.currentUser.email,status:"open",createdAt:serverTimestamp()});
export const myTickets=(cb,err)=>onSnapshot(query(collection(db,"tickets"),where("uid","==",auth.currentUser.uid)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),err);
export const getProfile=async()=>{const s=await getDoc(doc(db,"users",auth.currentUser.uid));return s.exists()?s.data():{}};
export const watchProfile=cb=>onSnapshot(doc(db,"users",auth.currentUser.uid),s=>cb(s.exists()?s.data():{}),()=>{});
export const saveProfile=p=>setDoc(doc(db,"users",auth.currentUser.uid),p,{merge:true});
export const resetPassword=e=>sendPasswordResetEmail(auth,e);
export const visit=(sid,d)=>{
  const r=doc(db,"visits",sid);
  return updateDoc(r,{lastSeen:serverTimestamp(),page:d.page,views:increment(1)}).catch(()=>setDoc(r,{first:serverTimestamp(),lastSeen:serverTimestamp(),views:1,device:d.device,ref:d.ref,page:d.page}));
};
export const visitBeat=sid=>updateDoc(doc(db,"visits",sid),{lastSeen:serverTimestamp()});
export const visitSet=(sid,d)=>updateDoc(doc(db,"visits",sid),d);
export function walletBox(parent){
  (window.WALLETS||[]).forEach(w=>{
    const d=document.createElement("div");d.className="wl";
    const b=document.createElement("b");
    const ns="http://www.w3.org/2000/svg",ic=document.createElementNS(ns,"svg"),u=document.createElementNS(ns,"use"),sp=document.createElement("span");
    ic.setAttribute("viewBox","0 0 24 24");ic.setAttribute("width","24");ic.setAttribute("height","24");
    u.setAttribute("href","#p-"+({Ethereum:"eth",Bitcoin:"btc",BNB:"bnb"}[w.coin]||"btc"));ic.appendChild(u);
    sp.textContent=w.coin+" ("+w.net+")";
    b.style.cssText="display:flex;align-items:center;gap:8px";b.appendChild(ic);b.appendChild(sp);
    const c=document.createElement("code");c.textContent=w.addr;
    const k=document.createElement("button");k.type="button";k.textContent="Copy address";
    k.onclick=()=>{navigator.clipboard.writeText(w.addr).then(()=>{k.textContent="Copied"}).catch(()=>{k.textContent="Press and hold the address to copy"})};
    d.append(b,c,k);parent.appendChild(d);
  });
}
