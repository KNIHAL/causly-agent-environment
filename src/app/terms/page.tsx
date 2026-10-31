import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalList } from "@/components/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using the Causly website and Causly Server.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="October 31, 2026">
      <LegalSection title="1. Acceptance">
        <p>
          By using this website or Causly Server, you agree to these terms. If you do not agree, do
          not use them.
        </p>
      </LegalSection>

      <LegalSection title="2. The software">
        <p>
          Causly Server is open-source software released under the{" "}
          <a className="text-accent hover:text-accent-bright" href={site.license} target="_blank" rel="noopener noreferrer">
            MIT License
          </a>
          . The license governs your right to use, copy, modify and distribute the software. If
          these terms and the license conflict about the software itself, the license applies.
        </p>
      </LegalSection>

      <LegalSection title="3. Your responsibility">
        <p>
          Causly Server lets an AI agent read files, run commands, push code, send messages and
          change data in services you connect. You are responsible for:
        </p>
        <LegalList
          items={[
            "The keys and permissions you give the software, and keeping them secure.",
            "Reviewing and approving actions, including any call made with confirm: true.",
            "The agent and model you connect, and what they do with the tools you allow.",
            "Keeping backups of important data before running destructive actions.",
            "Complying with the laws and the terms of the third-party services you use.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Safety features are guardrails">
        <p>
          Permission levels, the approval gate, the workspace limit and command checks reduce the
          risk of mistakes. They are not a sandbox and do not guarantee that an agent cannot cause
          harm. See the security documentation for what is and is not protected.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-party services">
        <p>
          Causly Server connects to services such as GitHub, Vercel, Google, Slack and others using
          your credentials. Those services are not operated by Causly and are governed by their own
          terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>
          Do not use the software to break the law, violate the rights of others, access systems
          without permission, or attack the services it connects to.
        </p>
      </LegalSection>

      <LegalSection title="7. No warranty">
        <p>
          The software and this website are provided &quot;as is&quot; and &quot;as available&quot;,
          without warranties of any kind, express or implied, including fitness for a particular
          purpose, and non-infringement. We do not promise uninterrupted or error-free operation.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the maximum extent permitted by applicable law, Causly and its contributors are not
          liable for any indirect, incidental, special or consequential damages, or for loss of data,
          profits or business, arising from your use of the software or website, including actions
          taken by an AI agent using the software.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update these terms from time to time. The date above shows the latest revision.
          Continued use after a change means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Questions about these terms:{" "}
          <a className="text-accent hover:text-accent-bright" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
