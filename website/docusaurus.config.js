// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Causly Docs',
  tagline: 'One conversation. Your whole stack.',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://agenv.causly.in',
  baseUrl: '/docs/',

  organizationName: 'KNIHAL',
  projectName: 'agenv',

  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          path: 'docs',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'Causly',
          src: 'img/causly-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/KNIHAL/causly-server',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Architecture', to: '/docs/server/architecture'},
              {label: 'All tool categories', to: '/docs/server/tools/overview'},
            ],
          },
          {
            title: 'Project',
            items: [
              {label: 'Roadmap', href: 'https://github.com/KNIHAL/causly-server/blob/master/ROADMAP.md'},
              {label: 'Changelog', href: 'https://github.com/KNIHAL/causly-server/blob/master/CHANGELOG.md'},
              {label: 'Contributing', href: 'https://github.com/KNIHAL/causly-server/blob/master/CONTRIBUTING.md'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'GitHub', href: 'https://github.com/KNIHAL/causly-server'},
              {label: 'Contact', href: 'mailto:nihal@causly.in'},
            ],
          },
        ],
        copyright: `causly-server — MIT licensed. Built by Kumar Nihal. © ${new Date().getFullYear()}`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
      },
    }),
};

export default config;
