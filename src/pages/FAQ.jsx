import { useState } from "react";

import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";

function FAQ() {
  const { language } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState(null);


  const faqs = [

    {
      question:
        "What is the purpose of developing this MIS Portal?",

      answer:
        "The Scheme MIS Portal has been developed to provide a centralized digital platform for effective monitoring, management and evaluation of various Government schemes. It facilitates systematic collection, management and analysis of scheme-related information and helps stakeholders track the progress and implementation of schemes."
    },

    {
      question:
        "What services are provided through the Scheme MIS Portal?",

      answer:
        "The Scheme MIS Portal provides services such as scheme-wise monitoring, project and activity tracking, data entry and management, progress monitoring, reporting, dashboards, notifications and access to scheme-related information. Authorized users can manage and monitor scheme activities according to their assigned roles."
    },

    {
      question:
        "Can the public access the Scheme MIS Portal?",

      answer:
        "Yes. The public can access publicly available information and resources such as information about schemes, general updates, FAQs, publications and other public resources. Access to operational modules and confidential scheme data is restricted to authorized users through secure login."
    }

  ];


  const toggleFAQ = (index) => {

    setOpenFAQ(
      openFAQ === index
        ? null
        : index
    );

  };


  return (
    <div>

      <Header />

      <Navbar />


      <section className="page-banner">

        <span>
          {translations[language].helpSupport}
        </span>

        <h1>
          {translations[language].frequentlyAskedQuestions}
        </h1>

        <p>
          {translations[language].faqDescription}
        </p>

      </section>


      <section className="faq-container">

        {faqs.map((faq, index) => (

          <div
            className="faq-item"
            key={index}
          >

            <button
              onClick={() => toggleFAQ(index)}
            >

              <span>
                {faq.question}
              </span>

              <strong>
                {openFAQ === index
                  ? "−"
                  : "+"
                }
              </strong>

            </button>


            {openFAQ === index && (

              <div className="faq-answer">

                <p>
                  {faq.answer}
                </p>

              </div>

            )}

          </div>

        ))}

      </section>


      <Footer />

    </div>
  );
}

export default FAQ;