import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";

function Login() {
  const { language } = useLanguage();

  return (
    <div>

      <Header />

      <Navbar />


      <section className="login-page">

        <div className="login-box">

          <h1>
            {translations[language].login}
          </h1>

          <p>
            {translations[language].loginToPortal}
          </p>


          <label>
            {translations[language].selectUserType}
          </label>

          <select>

            <option>
              {translations[language].selectUserType}
            </option>

            <option>
              {translations[language].implementingAgency}
            </option>

            <option>
              {translations[language].programDivision}
            </option>

            <option>
              {translations[language].nationalAuthority}
            </option>

            <option>
              {translations[language].hod}
            </option>

          </select>


          <label>
            {translations[language].username}
          </label>

          <input
            type="text"
            placeholder={translations[language].enterUsername}
          />


          <label>
            {translations[language].password}
          </label>

          <input
            type="password"
            placeholder={translations[language].password}
          />


          <button>
            {translations[language].login}
          </button>


          <a href="#">
            {translations[language].forgotPassword}
          </a>

        </div>

      </section>


      <Footer />

    </div>
  );
}

export default Login;