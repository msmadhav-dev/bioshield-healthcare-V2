"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Send, CheckCircle2, Clock } from "lucide-react";

const GREEN = "#14532D";

type Question = {
  id: string; question: string; answer?: string | null; status: string; createdAt: string;
};

type TabKey = "privacy" | "terms" | "disclaimer";

const TABS: { key: TabKey; label: string }[] = [
  { key: "privacy",    label: "Privacy Policy" },
  { key: "terms",      label: "Terms & Conditions" },
  { key: "disclaimer", label: "Disclaimer" },
];

export default function HelpAndSupportPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("privacy");

  const loadQuestions = useCallback(() => {
    setLoadingQuestions(true);
    fetch("/api/support-questions")
      .then((r) => r.json())
      .then((d) => setQuestions(Array.isArray(d.questions) ? d.questions : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQuestions(false));
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const handleSubmit = async () => {
    setError("");
    if (!text.trim()) { setError("Please type your question first."); return; }

    setSubmitting(true);
    try {
      const res  = await fetch("/api/support-questions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: text.trim() }),
      });
      const data = await res.json();
      if (data.question) {
        setText("");
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 4000);
        loadQuestions();
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { border: "1.5px solid #E0E0E5", backgroundColor: "#FAFAFA" };
  const onFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = GREEN);
  const onBlur  = (e: React.FocusEvent<HTMLTextAreaElement>) => (e.target.style.borderColor = "#E0E0E5");

  return (
    <div className="px-4 md:px-12 py-5 md:py-8 max-w-[820px]">
      <h1 className="text-[22px] md:text-[28px] font-extrabold text-gray-900 mb-6">
        Hi, what can we help you with?
      </h1>

      {/* Ask a question */}
      <div className="p-5 md:p-6 rounded-xl mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
        <label className="block text-[12.5px] font-semibold text-gray-700 mb-2">Your question</label>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={3}
          placeholder="Type your question here..."
          className="w-full px-4 py-3 text-[14px] outline-none text-gray-900 placeholder-gray-400 resize-none rounded-xl"
          style={inputStyle} onFocus={onFocus} onBlur={onBlur}
        />

        {error && <p className="text-[12.5px] mt-2" style={{ color: "#DC2626" }}>{error}</p>}

        {justSubmitted && (
          <div className="flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <CheckCircle2 size={16} style={{ color: GREEN }} />
            <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Thank you! We&apos;ll reply soon.</p>
          </div>
        )}

        <button
          type="button" onClick={handleSubmit} disabled={submitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[13.5px] font-bold text-white mt-3"
          style={{ backgroundColor: GREEN, opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit
        </button>
      </div>

      {/* Past questions */}
      {loadingQuestions ? (
        <div className="flex items-center justify-center py-6"><Loader2 size={18} className="animate-spin text-gray-400" /></div>
      ) : questions.length > 0 && (
        <div className="space-y-3 mb-8">
          {questions.map((q) => (
            <div key={q.id} className="p-4 md:p-5 rounded-lg" style={{ backgroundColor: "#FFFFFF", border: "1px solid #EFEFEF" }}>
              <p className="text-[13.5px] font-bold text-black mb-2">{q.question}</p>
              {q.status === "ANSWERED" && q.answer ? (
                <div className="pl-3" style={{ borderLeft: `2px solid ${GREEN}` }}>
                  <p className="text-[12.5px] font-semibold mb-0.5" style={{ color: GREEN }}>Bioshield Support</p>
                  <p className="text-[13px] text-gray-700">{q.answer}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400">
                  <Clock size={13} /> Pending reply
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legal tabs — same underline-tab style as the product detail page */}
      <div className="mt-2">
        <div className="flex items-center gap-7 overflow-x-auto" style={{ borderBottom: "1px solid #E5E7EB", scrollbarWidth: "none" }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className="flex-shrink-0 pb-3 text-[13.5px] font-bold whitespace-nowrap transition-colors"
                style={{
                  color:        isActive ? GREEN : "#9CA3AF",
                  borderBottom: isActive ? `2px solid ${GREEN}` : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="pt-6 pb-10 text-[13.5px] text-gray-700 leading-relaxed space-y-3">
          {activeTab === "privacy" && (
            <>
              <p><strong>Our Commitment</strong></p>
              <p>At Bioshield Healthcare Pvt Ltd (&quot;Bioshield&quot;) we understand the importance of protecting your personal data and privacy. We are committed to ensuring an adequate level of data protection and adhere to applicable data privacy and data protection laws.</p>
              <p>This Privacy Policy explains what information we collect when you visit or use this website, how we use it, and your rights regarding that information. By using this website, you agree to the terms of this Privacy Policy.</p>
              <p><strong>Information We Collect</strong></p>
              <p>We collect information you provide directly — such as your name, phone number, email, address, and order details — as well as information collected automatically, such as your IP address and browsing behaviour on our site, to help us operate, secure, and improve our services.</p>
              <p><strong>How We Use Your Information</strong></p>
              <p>We use your information to process orders, respond to your questions, provide customer support, share updates about your orders or account, and improve our products and services. We may use anonymised or aggregated data to understand usage trends and customer interests.</p>
              <p><strong>Disclosure of Information</strong></p>
              <p>We do not sell your personal information to third parties. We may share your information with service providers who help us operate the platform (such as payment processors or delivery partners), or when required by law, court order, or government authority.</p>
              <p><strong>Security</strong></p>
              <p>We take reasonable technical and organisational precautions to protect your personal information. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>
              <p><strong>Your Rights</strong></p>
              <p>You may contact us at any time to access, correct, or request deletion of your personal data, or if you have any questions about this policy, by reaching out to <strong>support@bioshieldhealthcare.com</strong>.</p>
            </>
          )}

          {activeTab === "terms" && (
            <>
              <p>Please read these terms carefully before using this website. By using the site, you agree to these terms and conditions, including any modifications made from time to time. If you do not agree, please do not use this website.</p>
              <p><strong>Acceptance of Use</strong></p>
              <p>By using this site, you confirm that you have read, understood, and accepted these terms of use, and agree to abide by any future modifications or amendments.</p>
              <p><strong>Use of Information</strong></p>
              <p>This website is for your personal, non-commercial use only. We make reasonable efforts to ensure the information about Bioshield, its products, and services displayed on this site is accurate. All material on this site is for general and educational purposes only and should not be treated as medical advice — always consult a qualified healthcare professional for diagnosis and treatment. You may not duplicate, modify, reproduce, publish, sell, or otherwise exploit any information, products, or services obtained from this site without our permission.</p>
              <p><strong>Amendments</strong></p>
              <p>Information on this site may occasionally contain technical inaccuracies or typographical errors. We reserve the right to update, change, or remove any part of these terms at any time, and to suspend the site for maintenance without prior notice. Continued use of the site after changes are posted constitutes your acceptance of the revised terms.</p>
              <p><strong>Intellectual Property</strong></p>
              <p>Bioshield&apos;s name, logo, and all related text and graphics on this site are the trademarks and copyright of Bioshield Healthcare Pvt Ltd. No part of this site may be reproduced, modified, or incorporated into any other work without our written permission. We reserve the right to restrict or terminate access to this site at our discretion, including where we believe a user&apos;s conduct violates these terms or applicable law.</p>
              <p><strong>Third-Party Links</strong></p>
              <p>This site may contain links to third-party websites for your convenience. Inclusion of such links does not imply endorsement by Bioshield, and access to them is entirely at your own risk.</p>
              <p><strong>Limitation of Liability</strong></p>
              <p>Bioshield shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your access to, use of, or inability to use this site.</p>
              <p><strong>Applicable Law</strong></p>
              <p>These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the jurisdiction of the courts located in Chennai, India.</p>
            </>
          )}

          {activeTab === "disclaimer" && (
            <>
              <p>The information provided on this website is for general, educational, and communication purposes only and is of limited business interest. Information regarding medicines, healthcare products, and related health conditions is provided for information and communication purposes only, and should not in any way be considered a representation or recommendation of any particular product or service for the treatment, prevention, or cure of any ailment.</p>
              <p>Bioshield Healthcare Pvt Ltd will not accept responsibility for any damages — direct, indirect, consequential, or punitive — arising out of or related to information provided, or not provided, on this website. Bioshield is not responsible for any damage to your device or for the privacy of your data through third-party links accessed from this site.</p>
              <p>Although this site is accessible worldwide, the site and its content are designed to comply with the laws and regulations applicable in India.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
