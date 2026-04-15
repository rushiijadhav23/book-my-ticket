import { register, login } from "../auth.js";
import { clearSession, getStoredUser, isAuthed } from "./storage.js";

export function bindAuthView({
  dom,
  toast,
  setBusy,
  onAuthed,
  onLoggedOut,
}) {
  const {
    authCard,
    app,
    authStatus,
    welcomeName,
    logoutBtn,
    myBookingsBtn,
    loginEmail,
    loginPassword,
    loginBtn,
    firstNameInput,
    lastNameInput,
    registerEmail,
    registerPassword,
    registerBtn,
    signInPanel,
    registerPanel,
    showRegisterBtn,
    showSignInBtn,
  } = dom;

  function setAuthMode(mode) {
    const isRegister = mode === "register";
    signInPanel?.classList.toggle("hidden", isRegister);
    registerPanel?.classList.toggle("hidden", !isRegister);
  }

  function syncAuthUI() {
    const authed = isAuthed();
    authCard.classList.toggle("hidden", authed);
    app.classList.toggle("hidden", !authed);
    logoutBtn.classList.toggle("hidden", !authed);
    myBookingsBtn.classList.toggle("hidden", !authed);

    authStatus.textContent = authed ? "Logged in" : "Logged out";

    const user = getStoredUser();
    const name =
      user?.firstName || user?.lastName
        ? [user?.firstName, user?.lastName].filter(Boolean).join(" ")
        : null;

    if (authed && name) {
      welcomeName.classList.remove("hidden");
      welcomeName.textContent = ` • Welcome, ${name}`;
    } else {
      welcomeName.classList.add("hidden");
      welcomeName.textContent = "";
    }

    if (!authed) setAuthMode("signin");
    return authed;
  }

  async function onRegister() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!email || !password) return toast("Email and password are required.", "error");
    setBusy(true);
    const res = await register({ firstName, lastName, email, password });
    setBusy(false);

    if (res?.error) return toast(res.error, "error");
    toast(res?.message || "Registered successfully. You can log in now.", "success");
    loginEmail.value = email;
    loginPassword.value = "";
    setAuthMode("signin");
  }

  async function onLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    if (!email || !password) return toast("Email and password are required.", "error");

    setBusy(true);
    const res = await login(email, password);
    setBusy(false);

    if (res?.token) {
      toast("Welcome back!", "success");
      syncAuthUI();
      onAuthed?.();
    } else {
      toast(res?.error || "Login failed.", "error");
    }
  }

  function onLogout() {
    clearSession();
    toast("Logged out.", "info");
    syncAuthUI();
    onLoggedOut?.();
  }

  // Bind
  loginBtn.addEventListener("click", onLogin);
  registerBtn.addEventListener("click", onRegister);
  logoutBtn.addEventListener("click", onLogout);

  showRegisterBtn?.addEventListener("click", () => setAuthMode("register"));
  showSignInBtn?.addEventListener("click", () => setAuthMode("signin"));

  [loginEmail, loginPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onLogin();
    })
  );
  [firstNameInput, lastNameInput, registerEmail, registerPassword].forEach((el) =>
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onRegister();
    })
  );

  // Initial
  const authed = syncAuthUI();
  if (authed) onAuthed?.();

  return { syncAuthUI, setAuthMode };
}

