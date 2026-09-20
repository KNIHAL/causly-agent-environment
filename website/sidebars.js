// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Server',
      collapsed: true,
      items: [
        'server/intro',
        'server/getting-started',
        'server/architecture',
        {
          type: 'category',
          label: 'Tools',
          link: {type: 'doc', id: 'server/tools/overview'},
          items: [
            'server/tools/filesystem-git-shell',
            'server/tools/github',
            'server/tools/vercel',
            'server/tools/supabase',
            'server/tools/slack',
            'server/tools/gmail',
            'server/tools/notion',
            'server/tools/terraform',
            'server/tools/docker',
            'server/tools/database',
            'server/tools/secrets',
            'server/tools/sentry',
            'server/tools/boundaryattest',
            'server/tools/workflow-tools',
          ],
        },
        'server/security',
        'server/deployment',
        'server/development',
        'server/troubleshooting',
        'server/limitations',
      ],
    },
    {
      type: 'category',
      label: 'Hosted',
      collapsed: true,
      items: ['hosted/intro'],
    },
    {
      type: 'category',
      label: 'Runtime',
      collapsed: true,
      items: ['runtime/intro'],
    },
    {
      type: 'category',
      label: 'IDE',
      collapsed: true,
      items: ['ide/intro'],
    },
  ],
};

export default sidebars;
