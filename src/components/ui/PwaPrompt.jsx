import { useEffect, useState } from "react";

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="pwa-prompt">
      <div>
        <h3>Install app</h3>
        <p>Add this application to your home screen for a faster, app-like experience.</p>
      </div>
      <button type="button" className="primary-button" onClick={handleInstall}>
        Install
      </button>
    </div>
  );
}
