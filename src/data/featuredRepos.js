// Featured repos shelf on the home screen. List written by the UI side (src/mocks/sampleGame.js),
// moved here so the real engine can export it too.

export const FEATURED_REPOS = [
  {
    owner: 'torvalds',
    repo: 'linux',
    title: 'Linux Kernel',
    description: 'The monolith operating system kernel started in 1991 by Linus Torvalds.',
    tag: 'High Difficulty',
  },
  {
    owner: 'facebook',
    repo: 'react',
    title: 'React',
    description: 'The web UI library that popularized component-based declarative architecture.',
    tag: 'Popular',
  },
  {
    owner: 'git',
    repo: 'git',
    title: 'Git Core',
    description: 'The very source code of the distributed version control system.',
    tag: 'Meta',
  },
  {
    owner: 'pallets',
    repo: 'flask',
    title: 'Flask',
    description: 'A lightweight WSGI web application framework in Python.',
    tag: 'Python Classic',
  },
]
