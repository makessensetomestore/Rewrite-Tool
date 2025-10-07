// Firebase & other imports assumed
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-functions.js";
import { firebaseConfig } from "../firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// UI elements
const authSection = document.getElementById("auth-section");
const toolSection = document.getElementById("tool-section");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const authMessage = document.getElementById("auth-message");
const userEmailSpan = document.getElementById("user-email");
const creditCountSpan = document.getElementById("credit-count");
const logoutBtn = document.getElementById("logout-btn");

const inputText = document.getElementById("input-text");
const rewriteBtn = document.getElementById("rewrite-btn");
const rewriteStyleSelect = document.getElementById("rewrite-style");
const outputText = document.getElementById("output-text");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");
const wordCountDiv = document.getElementById("word-count");
const convertGrid = document.getElementById("convert-grid");

// Promo banner
const promoBanner = document.getElementById("promo-banner");
const upgradeBtn = document.getElementById("upgrade-btn");

// Styles definitions
const rewriteStyles = [
  { key: "Formal", premium: false },
  { key: "Casual", premium: false },
  { key: "Friendly", premium: false },
  { key: "Persuasive", premium: false },
  { key: "Concise", premium: false },
  { key: "Funny", premium: false },
  { key: "Boost It!", premium: true },
  { key: "SEO Optimized", premium: true },
  { key: "Storytelling", premium: true }
];

const convertStyles = [
  { key: "Upside Down", fn: text => text.split("").reverse().map(c => upsideMap[c] || c).join(""), premium: false },
  { key: "Backwards", fn: text => text.split("").reverse().join(""), premium: false },
  { key: "Mirror", fn: text => text.split("").map(c => mirrorMap[c] || c).join(""), premium: false },
  { key: "Vertical", fn: text => text.split("").join("\n"), premium: false },
  { key: "Wave", fn: text => waveEffect(text), premium: true },
  { key: "Glitch", fn: text => glitchEffect(text), premium: true },
  { key: "Emoji", fn: text => emojiWrapper(text), premium: true }
];

// Fill rewrite style dropdown
rewriteStyles.forEach(s => {
  const option = document.createElement("option");
  option.value = s.key;
  option.textContent = s.key + (s.premium ? " 🔒" : "");
  rewriteStyleSelect.appendChild(option);
});

// Build convert‑grid
convertStyles.forEach(c => {
  const tile = document.createElement("div");
  tile.className = "convert-tile";
  tile.innerText = c.key + (c.premium ? " 🔒" : "");
  tile.onclick = () => {
    const txt = inputText.value;
    if (c.premium && !currentUser?.isPremium) {
      alert("Upgrade to use this style.");
      return;
    }
    convertOutput(txt, c.fn);
  };
  convertGrid.appendChild(tile);
});

// Handle copy / download / word count
copyBtn.onclick = () => {
  navigator.clipboard.writeText(outputText.value);
};
downloadBtn.onclick = () => {
  const blob = new Blob([outputText.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rewrite.txt";
  a.click();
  URL.revokeObjectURL(url);
};
function updateWordCount(text) {
  const count = text.trim().split(/\s+/).filter(w => w).length;
  wordCountDiv.innerText = "Words: " + count;
}

// Convert helper
function convertOutput(input, fn) {
  const result = fn(input);
  outputText.value = result;
  updateWordCount(result);
}

// Rewrite logic
rewriteBtn.onclick = async () => {
  const style = rewriteStyleSelect.value;
  const text = inputText.value;
  if (!text) {
    alert("Enter text first.");
    return;
  }
  // Check credits and premium
  const userDocRef = doc(db, "users", auth.currentUser.uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.data();
  if (rewriteStyles.find(s => s.key === style).premium && !userData.isPremium) {
    alert("Upgrade to premium to use this style.");
    return;
  }

  // Call backend function
  const rewriteFn = httpsCallable(functions, "rewrite");
  const res = await rewriteFn({ text, style });
  const out = res.data.result;
  outputText.value = out;
  updateWordCount(out);

  // Deduct credit
  await updateDoc(userDocRef, {
    credits: userData.credits - 1
  });
  loadCredits();
};

// Load user credits
async function loadCredits() {
  const u = auth.currentUser;
  if (!u) return;
  const docRef = doc(db, "users", u.uid);
  const snap = await getDoc(docRef);
  const d = snap.exists() ? snap.data() : null;
  creditCountSpan.innerText = d?.credits ?? "0";
}

// Auth flows
signupBtn.onclick = async () => {
  const email = emailInput.value;
  const pw = passwordInput.value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await sendEmailVerification(cred.user);
    await setDoc(doc(db, "users", cred.user.uid), {
      credits: 50,
      isPremium: false
    });
    authMessage.innerText = "Verify your email before logging in.";
  } catch (e) {
    authMessage.innerText = e.message;
  }
};
loginBtn.onclick = async () => {
  const email = emailInput.value;
  const pw = passwordInput.value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    if (!cred.user.emailVerified) {
      authMessage.innerText = "Please verify your email.";
      await signOut(auth);
      return;
    }
    authSection.classList.add("hidden");
    toolSection.classList.remove("hidden");
    userEmailSpan.innerText = email;
    loadCredits();
    checkPromoBanner();
  } catch (e) {
    authMessage.innerText = e.message;
  }
};
logoutBtn.onclick = async () => {
  await signOut(auth);
  toolSection.classList.add("hidden");
  authSection.classList.remove("hidden");
};

// On auth state change
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.classList.add("hidden");
    toolSection.classList.remove("hidden");
    userEmailSpan.innerText = user.email;
    loadCredits();
    checkPromoBanner();
  } else {
    authSection.classList.remove("hidden");
    toolSection.classList.add("hidden");
  }
});

// Show / hide promo banner
function checkPromoBanner() {
  const now = new Date();
  const cutoff = new Date(2025, 9, 31, 23, 59, 59); // Oct is month 9 (0-indexed)
  if (now < cutoff) {
    promoBanner.classList.remove("hidden");
  } else {
    promoBanner.classList.add("hidden");
  }
}
