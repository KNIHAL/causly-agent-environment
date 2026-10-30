// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      collapsible: false,
      collapsed: false,
      items: ['server/intro', 'server/getting-started'],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsible: false,
      collapsed: false,
      items: ['server/architecture', 'server/security'],
    },
    {
      type: 'category',
      label: 'Tools reference',
      collapsible: false,
      collapsed: false,
      items: [
        'server/tools/overview',
        {
          type: 'category',
          label: 'Core',
          collapsed: true,
          items: ['server/tools/filesystem-git-shell', 'server/tools/workflow-tools'],
        },
        {
          type: 'category',
          label: 'Development and infrastructure',
          collapsed: true,
          items: [
            'server/tools/github',
            'server/tools/docker',
            'server/tools/terraform',
            'server/tools/vercel',
            'server/tools/supabase',
            'server/tools/database',
          ],
        },
        {
          type: 'category',
          label: 'Observability',
          collapsed: true,
          items: ['server/tools/sentry'],
        },
        {
          type: 'category',
          label: 'Sales and growth',
          collapsed: true,
          items: [
            'server/tools/research',
            'server/tools/leads',
            'server/tools/pipeline',
            'server/tools/seo',
          ],
        },
        {
          type: 'category',
          label: 'Productivity',
          collapsed: true,
          items: [
            'server/tools/meetings',
            'server/tools/reminders',
            'server/tools/calendar',
            'server/tools/linear',
            'server/tools/notion',
          ],
        },
        {
          type: 'category',
          label: 'Communication',
          collapsed: true,
          items: ['server/tools/slack', 'server/tools/gmail', 'server/tools/telegram'],
        },
        {
          type: 'category',
          label: 'Security and secrets',
          collapsed: true,
          items: ['server/tools/secrets', 'server/tools/boundaryattest'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      collapsible: false,
      collapsed: false,
      items: ['server/cli', 'server/configuration'],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsible: false,
      collapsed: false,
      items: ['server/troubleshooting', 'server/limitations'],
    },
    {
      type: 'category',
      label: 'Contributing',
      collapsible: false,
      collapsed: false,
      items: ['server/development'],
    },
  ],
};

export default sidebars;
