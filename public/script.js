// Imports assumed: Firebase, Firestore, Functions

// UI elements
const promoBanner = document.getElementById("promo-banner");
const upgradeBtn = document.getElementById("upgrade-btn");
const logoutBtn = document.getElementById("logout-btn");
const darkModeToggle = document.getElementById("dark-mode-toggle");

const authSection = document.getElementById("auth-section");
const toolSection = document.getElementById("tool-section");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");
const stayLoggedInCheckbox = document.getElementById("stay-logged-in");

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const forgotPwdLink = document.getElementById("forgot-password-link");
const authMessage = document.getElementById("auth-message");

const userEmailSpan = document.getElementById("user-email");
const creditCountSpan = document.getElementById("credit-count");

const inputText = document.getElementById("input-text");
const rewriteStyleSelect = document.getElementById("rewrite-style");
const rewriteBtn = document.getElementById("rewrite-btn");

const outputText = document.getElementById("output-text");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");
const wordCountDiv = document.getElementById("word-count");

const convertGrid = document.getElementById("convert-grid");

// Sample style arrays (as before)
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

// Utility: show / hide promo
function checkPromoBanner() {
  const now = new Date();
  const cutoff = new Date(2025, 9, 31, 23, 59, 59);  // Oct = 9 (0-indexed)
  if (now < cutoff) promoBanner.classList.remove("hidden");
  else promoBanner.classList.add("hidden");
}

// Word count
function updateWordCount(text) {
  const count = text.trim().split(/\s+/).filter(w => w).length;
  wordCountDiv.innerText = "Words: " + count;
}

// Copy / Download
copyBtn.onclick = () => {
  navigator.clipboard.writeText(outputText.value);
};
downloadBtn.onclick = () => {
  const blob = new Blob([outputText.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rewritten.txt";
  a.click();
  URL.revokeObjectURL(url);
};

// Build rewrite dropdown
rewriteStyles.forEach(s => {
  const opt = document.createElement("option");
  opt.value = s.key;
  opt.innerText = s.key + (s.premium ? " 🔒" : "");
  rewriteStyleSelect.appendChild(opt);
});

// Build convert grid
convertStyles.forEach(c => {
  const tile = document.createElement("div");
  tile.className = "convert-tile";
  tile.innerText = c.key + (c.premium ? " 🔒" : "");
  tile.onclick = () => {
    const txt = inputText.value;
    if (c.premium && !currentUser?.isPremium) {
      alert("Upgrade to use this style");
      return;
    }
    const result = c.fn(txt);
    outputText.value = result;
    updateWordCount(result);
  };
  convertGrid.appendChild(tile);
});

// AUTH: Sign up
signupBtn.onclick = async () => {
  const email = emailInput.value;
  const pw = passwordInput.value;
  const cpw = confirmPasswordInput.value;
  if (pw !== cpw) {
    authMessage.innerText = "Passwords do not match.";
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pw);
    await sendEmailVerification(cred.user);
    await setDoc(doc(db, "users", cred.user.uid), {
      credits: 50,
      isPremium: false
    });
    authMessage.innerText = "Thank you! A verification email has been sent.";
  } catch (e) {
    authMessage.innerText = e.message;
  }
};

// AUTH: Log in
loginBtn.onclick = async () => {
  const email = emailInput.value;
  const pw = passwordInput.value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pw);
    if (!cred.user.emailVerified) {
      authMessage.innerText = "Check your email to verify your account.";
      await signOut(auth);
      return;
    }
    authSection.classList.add("hidden");
    toolSection.classList.remove("hidden");
    userEmailSpan.innerText = email;
    checkPromoBanner();
    loadCredits();
  } catch (e) {
    authMessage.innerText = e.message;
  }
};

// Forgot password
forgotPwdLink.onclick = async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  if (!email) {
    authMessage.innerText = "Enter your email above to reset password.";
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    authMessage.innerText = "Password reset email sent.";
  } catch (e) {
    authMessage.innerText = e.message;
  }
};

// Logout
logoutBtn.onclick = async () => {
  await signOut(auth);
  toolSection.classList.add("hidden");
  authSection.classList.remove("hidden");
};

// Auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    authSection.classList.add("hidden");
    toolSection.classList.remove("hidden");
    userEmailSpan.innerText = user.email;
    checkPromoBanner();
    loadCredits();
  } else {
    authSection.classList.remove("hidden");
    toolSection.classList.add("hidden");
  }
});

// Load credits
async function loadCredits() {
  const u = auth.currentUser;
  if (!u) return;
  const docRef = doc(db, "users", u.uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const d = snap.data();
    creditCountSpan.innerText = d.credits;
  }
}

// Rewrite action
rewriteBtn.onclick = async () => {
  // similar to earlier rewrite logic: check premium lock, call function, update result, deduct credit, update UI
};

// Immediately on load
window.onload = () => {
  checkPromoBanner();
};
