#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# Author:  Samuel Lörtscher
# Date:    04 January 2026
# Project: LectorGPT (LaTeX inline text refinement powered by OpenAI models)
# ------------------------------------------------------------------------------

set -e
cat << 'EOF' >> /etc/bash.bashrc

# --- Project aliases ---
alias ll='ls -alF'
alias gb='git branch'
alias gs='git status'
alias gl='git log --oneline --graph --decorate'
alias ga='git add -A'
alias gc='git commit -m'
# -----------------------

EOF