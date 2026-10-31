import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Causly Server and the Causly website handle your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" updated="October 31, 2026">
      <LegalSection title="1. Scope">
        <p>
          This policy covers this website ({site.url}) and Causly Server, the open-source software
          published as the <code className="text-code-text">causly-server</code> npm package. It
          explains what information is handled, where, and by whom.
        </p>
      </LegalSection>

      <LegalSection title="2. Causly Server runs on your computer">
        <p>
          Causly Server is a process that your editor or agent starts on your own machine. There is
          no Causly cloud and no Causly account. Causly does not receive your prompts, files, keys,
          pipeline, meetings or reminders.
        </p>
        <LegalList
          items={[
            "Your API keys and settings are stored in ~/.causly/.env on your computer.",
            "Your pipeline, meetings and reminders are stored in a local SQLite database on your computer.",
            "The secrets store is encrypted on your computer with a key that only you hold.",
            "A structured activity log of tool calls, with secrets redacted, is written to your computer.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Data sent to services you connect">
        <p>
          When your agent calls a tool for a service you configured, such as GitHub, Vercel, Slack,
          Gmail, Google Calendar, Telegram, Linear, Notion, Sentry, Groq or Tavily, the data needed
          for that call is sent to that service using your own credentials. That service handles it
          under its own terms and privacy policy. Causly does not see or store that data.
        </p>
        <p>
          Audio is uploaded to Groq for transcription only when you confirm a meeting transcription
          call.
        </p>
      </LegalSection>

      <LegalSection title="4. Update check">
        <p>
          The <code className="text-code-text">status</code> and{" "}
          <code className="text-code-text">doctor</code> commands ask the npm registry for the
          latest published version, at most once a day. You can turn this off by setting{" "}
          <code className="text-code-text">CAUSLY_UPDATE_CHECK=off</code>.
        </p>
      </LegalSection>

      <LegalSection title="5. This website">
        <p>
          This website does not ask you to create an account. Like most websites, our hosting
          provider may process standard request information such as IP address, browser type and
          pages requested, to deliver the site and keep it secure. We do not use advertising
          trackers on this website.
        </p>
        <p>
          If you email us, we receive the information you include in the message, and we use it only
          to respond.
        </p>
      </LegalSection>

      <LegalSection title="6. Your responsibilities">
        <p>
          You decide which keys to give the software and which actions to approve. Create
          fine-grained, revocable keys with the smallest scopes you need, and keep your backups and
          the folder ~/.causly secure.
        </p>
      </LegalSection>

      <LegalSection title="7. Children">
        <p>This website and software are intended for developers and are not directed to children.</p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          We may update this policy as the software or website changes. The date above shows the
          latest revision. Continued use after a change means you accept the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Questions about this policy:{" "}
          <a className="text-accent hover:text-accent-bright" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
