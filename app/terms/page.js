'use client'

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="glass rounded-full px-5 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="YoMeet Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-black">YoMeet</span>
            </div>
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Back to Home
            </a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
                <span className="gradient-text">Terms of Service</span>
              </h1>
              <p className="text-gray-400">Last updated: January 2025</p>
            </div>

            <div className="glass rounded-3xl p-8 sm:p-12 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  By accessing and using YoMeet ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">2. Description of Service</h2>
                <p className="text-gray-300 leading-relaxed">
                  YoMeet provides an AI-powered meeting recording, transcription, and summarization service. The Service allows users to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Record audio meetings and conversations</li>
                  <li>Transcribe audio to text using AI technology</li>
                  <li>Generate summaries and action items from transcripts</li>
                  <li>Organize and manage recordings in folders</li>
                  <li>Share recordings with other users</li>
                  <li>Chat with AI about recording content</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">3. User Accounts</h2>
                <p className="text-gray-300 leading-relaxed">
                  To use certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept all responsibility for activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">4. Recording and Consent</h2>
                <p className="text-gray-300 leading-relaxed">
                  You are solely responsible for ensuring that you have the legal right to record any conversations or meetings. You must:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Obtain consent from all participants before recording</li>
                  <li>Comply with all applicable local, state, and federal laws regarding recording</li>
                  <li>Inform participants that the conversation is being recorded</li>
                  <li>Use recordings only for lawful purposes</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  YoMeet is not responsible for any illegal recording or use of the Service that violates applicable laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">5. Acceptable Use</h2>
                <p className="text-gray-300 leading-relaxed">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Upload or transmit viruses or malicious code</li>
                  <li>Spam, solicit, or harass other users</li>
                  <li>Collect or store personal data about other users without consent</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Record confidential or sensitive information without proper authorization</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">6. Intellectual Property</h2>
                <p className="text-gray-300 leading-relaxed">
                  You retain all rights to the content you create and upload to YoMeet. By using the Service, you grant YoMeet a limited license to process, store, and display your content solely for the purpose of providing the Service.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  The YoMeet platform, including its design, features, and technology, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">7. Subscription and Payment</h2>
                <p className="text-gray-300 leading-relaxed">
                  Some features of the Service require a paid subscription. By subscribing, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Pay all fees associated with your subscription plan</li>
                  <li>Provide current, complete, and accurate billing information</li>
                  <li>Automatic renewal of your subscription unless cancelled</li>
                  <li>No refunds for partial subscription periods</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to change our pricing with 30 days' notice to existing subscribers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">8. Data Privacy and Security</h2>
                <p className="text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your data. We implement industry-standard security measures to protect your recordings and personal information.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee its absolute security.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">9. AI-Generated Content</h2>
                <p className="text-gray-300 leading-relaxed">
                  YoMeet uses artificial intelligence to transcribe and summarize recordings. While we strive for accuracy:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Transcriptions and summaries may contain errors</li>
                  <li>AI-generated content should be reviewed for accuracy</li>
                  <li>YoMeet is not responsible for decisions made based on AI-generated content</li>
                  <li>You should verify important information independently</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">10. Termination</h2>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right to suspend or terminate your account if you violate these Terms of Service. You may also cancel your account at any time through your account settings.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Upon termination, your right to use the Service will immediately cease. We may retain certain data as required by law or for legitimate business purposes.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">11. Disclaimer of Warranties</h2>
                <p className="text-gray-300 leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>The Service will be uninterrupted or error-free</li>
                  <li>Defects will be corrected</li>
                  <li>The Service is free from viruses or harmful components</li>
                  <li>Results obtained from using the Service will be accurate or reliable</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">12. Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOMEET SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months prior to the claim.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">13. Indemnification</h2>
                <p className="text-gray-300 leading-relaxed">
                  You agree to indemnify and hold harmless YoMeet, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your recordings or content</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">14. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed">
                  We may modify these Terms of Service at any time. We will notify you of material changes via email or through the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">15. Governing Law</h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which YoMeet operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold">16. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="list-none text-gray-300 space-y-2 ml-4">
                  <li>Email: legal@yomeet.com</li>
                  <li>Website: <a href="/contact" className="text-primary hover:underline">Contact Page</a></li>
                </ul>
              </section>

              <section className="space-y-4 pt-8 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  By using YoMeet, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-2">
            <p className="text-gray-400">&copy; 2025 YoMeet. All rights reserved.</p>
            <p className="text-gray-500 text-sm">A <span className="text-primary font-semibold">Papcy</span> Company</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
