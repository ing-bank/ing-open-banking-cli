# Contributing

Check out ways to contribute to ING Open Banking CLI:

## Feature requests

When you have an idea on how we could improve, please check our [discussions](https://github.com/ing-bank/ing-open-banking-cli/discussions) to see if there are similar ideas or feature requests. If there are none, please [start](https://github.com/ing-bank/lion/discussions/new) your feature request as a new discussion topic. Add the title `[Feature Request] My awesome feature` and a description of what you expect from the improvement and what the use case is.

## Existing components: we love pull requests ♥

Help out the whole community by sending your merge requests and issues.
Check out how to set it up:

Setup:

```bash
# Clone the repo:
git clone https://github.com/ing-bank/ing-open-banking-cli.git
cd ing-open-banking-cli

# Create a branch for your changes
git checkout -b fix/bash-signature
```

Make sure everything works as expected:

```bash
# Bash
cd scripts/bash
./call_all.sh

# Node.js
cd scripts/javascript
npm i && npm start
```

Create a Pull Request:

- At <https://github.com/ing-bank/ing-open-banking-cli> click on fork (at the right top)

```bash
# add fork to your remotes
git remote add fork git@github.com:<your-user>/ing-open-banking-cli.git

# push new branch to your fork
git push -u fork fix/bash-signature
```

- Go to your fork and create a Pull Request :).

Some things that will increase the chance that your merge request is accepted:

- Write test scripts.
- Write a [good commit message](https://www.conventionalcommits.org/).
